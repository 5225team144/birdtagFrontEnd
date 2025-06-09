function parseTokenFromUrl() {
  const hash = window.location.hash.substr(1);
  const params = new URLSearchParams(hash);
  const idToken = params.get("id_token");

  if (idToken) {
    localStorage.setItem("idToken", idToken);
    // Clean the URL
    window.history.replaceState(null, "", window.location.pathname);
  }
}

function requireLogin() {
  parseTokenFromUrl();
  const token = localStorage.getItem("idToken");

  if (!token) {
    // Redirect to Cognito Hosted UI for login
    window.location.href = "https://ap-southeast-2k4rcti6cd.auth.ap-southeast-2.amazoncognito.com/login?client_id=66gnv00j886spaj5na9f1km3ht&response_type=token&scope=email+openid+phone&redirect_uri=https://5225birdtags3-01.s3.ap-southeast-2.amazonaws.com/static_frontend/birdtagFrontEnd/public/pages/homePage.html";
  }
}
