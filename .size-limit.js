module.exports = [
  {
    name: "Main JS (App)",
    path: ".next/static/chunks/main-app-*.js",
    limit: "50 KB",
  },
  {
    name: "Framework",
    path: ".next/static/chunks/framework-*.js",
    limit: "50 KB",
  },
  {
    name: "App Page",
    path: ".next/static/chunks/app/page-*.js",
    limit: "100 KB",
  },
  {
    name: "Total First Load JS",
    path: [
      ".next/static/chunks/main-app-*.js",
      ".next/static/chunks/framework-*.js",
      ".next/static/chunks/app/page-*.js",
    ],
    limit: "170 KB",
  },
];
