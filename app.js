class Post {
  constructor(id, fileUrl, caption, username, profilePicture) {
    this.id = id;
    this.fileUrl = fileUrl;
    this.caption = caption;
    this.username = username
    this.profilePicture = profilePicture
  }
}

class App {

  constructor() {
    this.$app = document.querySelector("#app");
    this.$uploadModal = document.querySelector(".upload");
    this.$activeForm = document.querySelector(".active-form");
    this.$inactiveForm = document.querySelector(".inactive-form");
    this.$firebaseAuthContainer = document.querySelector("#firebaseui-auth-container");
    this.$uploadContainer = document.querySelector("#upload-container");
    this.$uploadButton = document.querySelector("#upload");
    this.$fileInput = document.getElementById("fileInput");
    this.$captionTextarea = document.getElementById("caption");
    this.$sendButton = document.getElementById("send");
    this.user = null;
    this.posts = [];
    this.userId = "";
    this.$ellipsisIcon = document.querySelector(".options .Igw0E");
    this.$optionsModal = document.getElementById("optionsModal");

    this.$authUserText = document.querySelector(".auth-user");
    this.$logoutButton = document.querySelector(".logout");
    this.ui = new firebaseui.auth.AuthUI(auth);
    this.$logoutButton = document.querySelector(".logout");
    this.handleAuth();
    this.addEventListeners();

  }


  toggleUploadContainer() {
    if (this.$uploadContainer.style.display === "none") {
      this.$uploadContainer.style.display = "block";
      this.$app.style.display = "none";
    } else {
      this.$uploadContainer.style.display = "none";
      this.$app.style.display = "block";
    }
  }

  handleAuth() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        console.log("user:", user)

        console.log(user.uid);
        this.userId = user.uid;
        this.$authUserText.innerHTML = user.displayName;
        if (user.photoURL) {
          this.user.profilePicture = user.photoURL;
        }
        this.redirectToApp();
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
    this.fetchPostsFromDB();
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
        uiShown: () => {
          document.getElementById('loader').style.display = 'none';
        }
      },
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID

      ],

    });
  }

  handleFileUpload() {
    if (this.files.length !== 0) {
      for (let i = 0; i < this.files.length; i++) {
        const timestamp = new Date().getTime();
        const storage = firebase.storage().ref(timestamp + "_" + this.files[i].name);
        const uploadTask = storage.put(this.files[i]);
        const captionValue = this.$captionTextarea.value;

        uploadTask.on(
          "state_changed",
          (snapshot) => {
          },
          (error) => {
            alert("Error uploading file");
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              const post = new Post(Date.now(), downloadURL, captionValue, this.user.displayName, this.user.photoURL); // Use this.user
              console.log("User object:", this.user);
              this.posts.push(post);
              this.savePosts();

              console.log("New post:", post);
            });

            document.getElementById("uploading").innerHTML += `${this.files[i].name} uploaded <br />`;
          }
        );
      }
    } else {
      alert("No file chosen");
    }
  }


  savePosts() {

    const postObj = this.posts.map(post => ({
      id: post.id,
      fileUrl: post.fileUrl,
      caption: post.caption,
      username: this.user.displayName,
      profilePicture: this.user.photoURL
    }));

    db.collection("users").doc(this.userId).set({
      posts: postObj
    })
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }

  fetchPostsFromDB() {
    db.collection("users").doc(this.userId).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const userPosts = userData.posts || [];
          this.posts = userPosts;
          this.renderPosts(this.posts);
        } else {
          console.log("User document not found");
        }
      })
      .catch((error) => {
        console.error("Error getting user's posts: ", error);
      });
  }


  renderPosts(posts) {
    const postContainer = document.querySelector("#post-container");

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");

      const profilePictureSrc = post.profilePicture ? post.profilePicture : '/assets/user-icon.jpeg';

      postElement.innerHTML = `
        <div class="header">
          <div class="profile-area">
            <div class="post-pic">
              <img alt="${post.username}'s profile picture" class="_6q-tv" data-testid="user-avatar" draggable="false" src="${profilePictureSrc}" />
            </div>
            <span class="profile-name">${post.username}</span>
          </div>
          <div class="options">
            <div class="Igw0E rBNOH YBx95 _4EzTm" style="height: 24px; width: 24px">
              <svg aria-label="More options" class="_8-yf5" fill="#262626" height="16" viewBox="0 0 48 48" width="16">
                <circle clip-rule="evenodd" cx="8" cy="24" fill-rule="evenodd" r="4.5"></circle>
                <circle clip-rule="evenodd" cx="24" cy="24" fill-rule="evenodd" r="4.5"></circle>
                <circle clip-rule="evenodd" cx="40" cy="24" fill-rule="evenodd" r="4.5"></circle>
              </svg>
            </div>
          </div>
        </div>
        <div class="body">
          <img alt="Photo by } on ${post.postDate}. ${post.imageDescription}" class="FFVAD" decoding="auto" sizes="614px" src="${post.fileUrl}" style="object-fit: cover" />
          <p><span class="profile-name">${post.username} </span> ${post.caption}</p>
        </div>
        <div class="footer">
         
        </div>
        <div class="add-comment">
          <input type="text" placeholder="Add a comment..." />
          <a class="post-btn">Post</a>
        </div>
      `;

      postContainer.appendChild(postElement);
    });
  }



  addEventListeners() {
    this.$logoutButton.addEventListener("click", (event) => {
      this.handleLogout();
    })

    this.$uploadButton.addEventListener("click", () => {
      this.toggleUploadContainer();
    });

    this.$fileInput.addEventListener("change", (event) => {
      this.files = event.target.files;
      for (let i = 0; i < this.files.length; i++) {
        console.log(this.files[i]);
      }
    });

    this.$sendButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.handleFileUpload();
    });
  }


}

const app = new App();