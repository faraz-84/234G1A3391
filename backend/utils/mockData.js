/**
 * Mock Campus Notifications
 * Used as a fallback for demonstration purposes when credentials are not yet configured.
 */
const mockNotifications = [
  {
    ID: "notif-100",
    Type: "Placement",
    Message: "Amazon is hiring Software Development Engineers. Package: 45 LPA. Apply before tomorrow!",
    Timestamp: "2026-05-30 11:20:00"
  },
  {
    ID: "notif-101",
    Type: "Result",
    Message: "Advanced Algorithms (CS-302) Mid-Sem Exam results have been published on the student portal.",
    Timestamp: "2026-05-30 10:45:00"
  },
  {
    ID: "notif-102",
    Type: "Event",
    Message: "Annual Hackathon 'Hack-A-Thon 2026' registration is now open for all engineering branches.",
    Timestamp: "2026-05-30 09:15:00"
  },
  {
    ID: "notif-103",
    Type: "Placement",
    Message: "Microsoft shortlisting results for Summer Internship 2026 are out. Check your registered emails.",
    Timestamp: "2026-05-30 08:30:00"
  },
  {
    ID: "notif-104",
    Type: "Event",
    Message: "Guest Lecture by Dr. Sarah Connor on 'Safety Controls in Artificial Intelligence' at Seminar Hall-A.",
    Timestamp: "2026-05-29 15:30:00"
  },
  {
    ID: "notif-105",
    Type: "Result",
    Message: "Database Management Systems Lab (CS-314) final practical exam grades are now online.",
    Timestamp: "2026-05-29 14:00:00"
  },
  {
    ID: "notif-106",
    Type: "Placement",
    Message: "Deloitte campus placement drive starting from June 5th. Pre-placement talk at 10:00 AM.",
    Timestamp: "2026-05-29 11:00:00"
  },
  {
    ID: "notif-107",
    Type: "Event",
    Message: "Inter-College Cricket Tournament team selection trials today at 4:30 PM on the main sports ground.",
    Timestamp: "2026-05-29 09:00:00"
  },
  {
    ID: "notif-108",
    Type: "Result",
    Message: "Re-evaluation results for Autumn Semester 2025 have been updated on the examination controller site.",
    Timestamp: "2026-05-28 16:45:00"
  },
  {
    ID: "notif-109",
    Type: "Placement",
    Message: "Google STEP Intern interview schedule sent to selected sophomore students. Interviews begin June 1st.",
    Timestamp: "2026-05-28 10:00:00"
  },
  {
    ID: "notif-110",
    Type: "Event",
    Message: "Campus Cleanliness Drive organized by NSS. Volunteers report to Administrative Block at 8:00 AM.",
    Timestamp: "2026-05-28 07:30:00"
  },
  {
    ID: "notif-111",
    Type: "Result",
    Message: "Compiler Design (CS-308) assignment-2 marks published. Direct queries to course TA.",
    Timestamp: "2026-05-27 15:00:00"
  }
];

module.exports = {
  mockNotifications
};
