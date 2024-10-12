  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
  const firebaseConfig = {
    apiKey: "AIzaSyARDxDlTMVvpm_deaut9qwy2qrtWG9rZBQ",
    authDomain: "owen-uno.firebaseapp.com",
    projectId: "owen-uno",
    storageBucket: "owen-uno.appspot.com",
    messagingSenderId: "131464317652",
    appId: "1:131464317652:web:405f86bff2ea4150018941",
    measurementId: "G-PKR2D1672G"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);