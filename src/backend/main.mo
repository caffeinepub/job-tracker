import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import VarArray "mo:core/VarArray";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type EmploymentType = {
    #fullTime;
    #partTime;
    #internship;
    #contract;
  };

  type JobCategory = {
    #accounting;
    #analytics;
    #audit;
    #tax;
  };

  type ApplicationStatus = {
    #notApplied;
    #applied;
    #interviewing;
    #offer;
    #rejected;
    #withdrawn;
  };

  type Firm = {
    id : Nat;
    name : Text;
    description : Text;
    website : Text;
    size : {
      #big4;
      #midSize;
      #small;
    };
  };

  type JobPosting = {
    id : Nat;
    title : Text;
    firmId : Nat;
    firmName : Text;
    category : JobCategory;
    location : Text;
    postingUrl : Text;
    datePosted : ?Nat;
    employmentType : ?EmploymentType;
    isOpen : Bool;
  };

  type JobTracking = {
    jobPostingId : Nat;
    saved : Bool;
    applicationStatus : ApplicationStatus;
    notes : Text;
    lastUpdated : Nat;
  };

  type JobPostingInput = {
    title : Text;
    firmId : Nat;
    firmName : Text;
    category : JobCategory;
    location : Text;
    postingUrl : Text;
    datePosted : ?Nat;
    employmentType : ?EmploymentType;
    isOpen : Bool;
  };

  type JobTrackingInput = {
    jobPostingId : Nat;
    saved : Bool;
    applicationStatus : ApplicationStatus;
    notes : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  type CSVJobInput = {
    title : Text;
    firmName : Text;
    category : Text;
    location : Text;
    postingUrl : Text;
    isOpen : Text;
  };

  // Persistent data structures
  let firms = Map.empty<Nat, Firm>();
  let jobs = Map.empty<Nat, JobPosting>();
  let userTrackings = Map.empty<Principal, Map.Map<Nat, JobTracking>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextFirmId = 1;
  var nextJobId = 1;
  var isInitialized = false;

  // Initialize with Big 4 firms on first call
  private func ensureInitialized() {
    if (not isInitialized) {
      firms.add(1, { id = 1; name = "Deloitte"; description = "Big 4 Accounting Firm"; website = "https://www2.deloitte.com/"; size = #big4 });
      firms.add(2, { id = 2; name = "PwC"; description = "Big 4 Accounting Firm"; website = "https://www.pwc.com/"; size = #big4 });
      firms.add(3, { id = 3; name = "EY"; description = "Big 4 Accounting Firm"; website = "https://www.ey.com/"; size = #big4 });
      firms.add(4, { id = 4; name = "KPMG"; description = "Big 4 Accounting Firm"; website = "https://home.kpmg/"; size = #big4 });
      nextFirmId := 5;
      isInitialized := true;
    };
  };

  // User Profile Management (required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only firm management
  public shared ({ caller }) func addOrUpdateFirm(firm : Firm) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add or update firms");
    };

    ensureInitialized();

    switch (firms.get(firm.id)) {
      case (null) {
        let newFirm = { firm with id = nextFirmId };
        firms.add(nextFirmId, newFirm);
        nextFirmId += 1;
      };
      case (?existingFirm) {
        firms.add(firm.id, firm);
      };
    };
  };

  // Public access - no auth required (guests can view)
  public query func getAllFirms() : async [Firm] {
    ensureInitialized();
    firms.values().toArray();
  };

  // Job posting management (admin role required)
  public shared ({ caller }) func createOrUpdateJobPosting(input : JobPostingInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create or update job postings");
    };

    ensureInitialized();

    let jobId = nextJobId;
    let newJob : JobPosting = {
      id = jobId;
      title = input.title;
      firmId = input.firmId;
      firmName = input.firmName;
      category = input.category;
      location = input.location;
      postingUrl = input.postingUrl;
      datePosted = input.datePosted;
      employmentType = input.employmentType;
      isOpen = input.isOpen;
    };

    jobs.add(jobId, newJob);
    nextJobId += 1;
    jobId;
  };

  // Admin-only: Close a job posting
  public shared ({ caller }) func closeJobPosting(jobId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can close job postings");
    };

    switch (jobs.get(jobId)) {
      case (null) {
        Runtime.trap("Job posting not found");
      };
      case (?job) {
        let updatedJob = { job with isOpen = false };
        jobs.add(jobId, updatedJob);
      };
    };
  };

  // Admin-only: Bulk import jobs from CSV text
  public shared ({ caller }) func bulkImportJobs(csvData : [CSVJobInput]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can bulk import jobs");
    };

    ensureInitialized();

    var importedCount = 0;

    for (csvRow in csvData.vals()) {
      // Parse category
      let category : JobCategory = switch (csvRow.category) {
        case ("Accounting") { #accounting };
        case ("Analytics") { #analytics };
        case ("Audit") { #audit };
        case ("Tax") { #tax };
        case (_) { #accounting }; // default
      };

      // Parse isOpen
      let isOpen = (csvRow.isOpen == "true" or csvRow.isOpen == "True" or csvRow.isOpen == "1");

      // Find firm by name or create placeholder
      var firmId = 0;
      var foundFirm = false;
      for ((id, firm) in firms.entries()) {
        if (firm.name == csvRow.firmName) {
          firmId := id;
          foundFirm := true;
        };
      };

      if (not foundFirm) {
        // Create a placeholder firm
        firmId := nextFirmId;
        firms.add(firmId, {
          id = firmId;
          name = csvRow.firmName;
          description = "";
          website = "";
          size = #midSize;
        });
        nextFirmId += 1;
      };

      let newJob : JobPosting = {
        id = nextJobId;
        title = csvRow.title;
        firmId = firmId;
        firmName = csvRow.firmName;
        category = category;
        location = csvRow.location;
        postingUrl = csvRow.postingUrl;
        datePosted = null;
        employmentType = null;
        isOpen = isOpen;
      };

      jobs.add(nextJobId, newJob);
      nextJobId += 1;
      importedCount += 1;
    };

    importedCount;
  };

  // Public access - no auth required (guests can view open jobs)
  public query func getAllOpenJobs() : async [JobPosting] {
    ensureInitialized();
    let openJobs = jobs.values().toArray().filter(
      func(job) { job.isOpen }
    );
    openJobs;
  };

  // Public access - get all jobs (for admin UI)
  public query func getAllJobs() : async [JobPosting] {
    ensureInitialized();
    jobs.values().toArray();
  };

  // User job tracking (user-only with ownership verification)
  public shared ({ caller }) func saveJobTracking(tracking : JobTrackingInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save job tracking information");
    };

    let currentTime = Time.now().toNat();

    let newTracking : JobTracking = {
      jobPostingId = tracking.jobPostingId;
      saved = tracking.saved;
      applicationStatus = tracking.applicationStatus;
      notes = tracking.notes;
      lastUpdated = currentTime;
    };

    let userId = caller;
    let userTrackingMap = switch (userTrackings.get(userId)) {
      case (null) {
        let m = Map.empty<Nat, JobTracking>();
        userTrackings.add(userId, m);
        m;
      };
      case (?map) { map };
    };

    userTrackingMap.add(tracking.jobPostingId, newTracking);
  };

  // User-only with ownership verification
  public query ({ caller }) func getUserJobTracking(user : Principal) : async [JobTracking] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own job tracking");
    };

    switch (userTrackings.get(user)) {
      case (null) { [] };
      case (?userTrackingMap) {
        userTrackingMap.values().toArray();
      };
    };
  };

  // Analytics: Open jobs count by firm (public - no auth required)
  public query func getOpenJobsByFirm() : async [(Text, Nat)] {
    ensureInitialized();
    let firmCounts = Map.empty<Text, Nat>();

    for (job in jobs.values()) {
      if (job.isOpen) {
        let currentCount = switch (firmCounts.get(job.firmName)) {
          case (null) { 0 };
          case (?count) { count };
        };
        firmCounts.add(job.firmName, currentCount + 1);
      };
    };

    firmCounts.entries().toArray();
  };

  // Analytics: Open jobs count by category (public - no auth required)
  public query func getOpenJobsByCategory() : async [(Text, Nat)] {
    ensureInitialized();
    var accountingCount = 0;
    var analyticsCount = 0;
    var auditCount = 0;
    var taxCount = 0;

    for (job in jobs.values()) {
      if (job.isOpen) {
        switch (job.category) {
          case (#accounting) { accountingCount += 1 };
          case (#analytics) { analyticsCount += 1 };
          case (#audit) { auditCount += 1 };
          case (#tax) { taxCount += 1 };
        };
      };
    };

    [
      ("Accounting", accountingCount),
      ("Analytics", analyticsCount),
      ("Audit", auditCount),
      ("Tax", taxCount),
    ];
  };

  // Analytics: User's saved jobs by application status (user-only with ownership)
  public query ({ caller }) func getUserJobsByStatus(user : Principal) : async [(Text, Nat)] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own job statistics");
    };

    var notAppliedCount = 0;
    var appliedCount = 0;
    var interviewingCount = 0;
    var offerCount = 0;
    var rejectedCount = 0;
    var withdrawnCount = 0;

    switch (userTrackings.get(user)) {
      case (null) {};
      case (?userTrackingMap) {
        for (tracking in userTrackingMap.values()) {
          if (tracking.saved) {
            switch (tracking.applicationStatus) {
              case (#notApplied) { notAppliedCount += 1 };
              case (#applied) { appliedCount += 1 };
              case (#interviewing) { interviewingCount += 1 };
              case (#offer) { offerCount += 1 };
              case (#rejected) { rejectedCount += 1 };
              case (#withdrawn) { withdrawnCount += 1 };
            };
          };
        };
      };
    };

    [
      ("Not Applied", notAppliedCount),
      ("Applied", appliedCount),
      ("Interviewing", interviewingCount),
      ("Offer", offerCount),
      ("Rejected", rejectedCount),
      ("Withdrawn", withdrawnCount),
    ];
  };

  // Analytics: Job posting trend (public - no auth required)
  public query func getJobPostingTrend() : async {
    recentPostings : Nat;
    olderPostings : Nat;
    trend : Text;
  } {
    ensureInitialized();
    let currentTime = Time.now().toNat();
    let thirtyDaysAgo = currentTime - (30 * 24 * 60 * 60 * 1_000_000_000);

    var recentCount = 0;
    var olderCount = 0;

    for (job in jobs.values()) {
      if (job.isOpen) {
        switch (job.datePosted) {
          case (null) {
            olderCount += 1;
          };
          case (?posted) {
            if (posted >= thirtyDaysAgo) {
              recentCount += 1;
            } else {
              olderCount += 1;
            };
          };
        };
      };
    };

    let trend = if (recentCount > olderCount) {
      "Increasing";
    } else if (recentCount < olderCount) {
      "Decreasing";
    } else {
      "Stable";
    };

    {
      recentPostings = recentCount;
      olderPostings = olderCount;
      trend = trend;
    };
  };
};
