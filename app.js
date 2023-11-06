class App {

    constructor() {
        this.$app = document.querySelector("#app");
        this.$firebaseAuthContainer = document.querySelector("#firebaseui-auth-container");
        this.$authUserText = document.querySelector(".auth-user");
        this.$logoutButton = document.querySelector(".logout");
        this.ui = new firebaseui.auth.AuthUI(auth);
        this.$logoutButton = document.querySelector(".logout");
        this.handleAuth();
        this.addEventListeners();
    }


handleAuth() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log(user.uid);
        this.userId = user.uid;
        this.$authUserText.innerHTML = user.displayName;
        this.redirectToApp();
        console.log(user);
      } else {
        this.redirectToAuth();
      }
    });
  }


  handleLogout() {
    firebase.auth().signOut().then(() => {
      this.redirectToAuth();
    }).catch((error) => {
      console.log("Error occured", error)
    });
  }
  redirectToApp() {
    this.$firebaseAuthContainer.style.display = "none";
    this.$app.style.display = "block";
  }

  redirectToAuth() {
    this.$firebaseAuthContainer.style.display = "block";
    this.$app.style.display = "none";

    this.ui.start('#firebaseui-auth-container', {
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          this.userId = authResult.user.uid;
          this.$authUserText.innerHTML = user.displayName;
          this.redirectToApp();
        },
        uiShown:  () => {
          document.getElementById('loader').style.display = 'none';
        }
      },
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID

      ],
    
    });
  }

  addEventListeners() {
    this.$logoutButton.addEventListener("click", (event) => {
        this.handleLogout();
      })
  }


}

const app = new App();