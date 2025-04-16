const RANKS = [
    "commander", // Commander
    "executive_officer", // Executive Officer
    "recruter",
    "commissioned_officer", // Commissioned Officer
    "officer", // Line Officer
    "private", // Midshipamn
];

const NAME = {
    "commander": "Commander",
    "executive_officer": "Deputy Commander",
    "recruter": "Recruiter",
    "commissioned_officer": "Commissioned Officer",
    "officer": "Line Officer",
    "private": "Midshipamn",
};

const POSITION = {
    "commander": 5,
    "executive_officer": 4,
    "recruter": 3,
    "commissioned_officer": 2,
    "officer": 1,
    "private": 0,
};

const SHORT = {
    "commander": "(CO)",
    "executive_officer": "(XO)",
    "recruter": "(R)",
    "commissioned_officer": "(C)",
    "officer": "(L)",
    "private": "(M)",
};


module.exports = { RANKS, NAME, POSITION, SHORT };
