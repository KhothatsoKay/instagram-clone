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
    this.selectedPostId = "";
    this.userId = "";
    this.$userProfilePicture = document.querySelector(".story-image");
    this.$authUserText = document.querySelector(".auth-user");
    this.$authUser = document.querySelector(".user-name");
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
        this.$authUser.innerHTML = user.displayName;
        const profilePic = this.user.photoURL;
        if(profilePic != null){
          this.$userProfilePicture.innerHTML = `<img  data-testid="user-avatar" draggable="false"
          src=${profilePic} />`
      }
      else{
        this.$userProfilePicture.innerHTML = `<img alt="profile picture" data-testid="user-avatar" draggable="false"
          src="/assets/user-icon.jpeg"/>`
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
              const post = new Post(Date.now(), downloadURL, captionValue, this.user.displayName, this.user.photoURL); 
              console.log("User object:", this.user);
              this.posts.push(post);
              this.savePosts();

              console.log("New post:", post);
            });

            document.getElementById("uploading").innerHTML += `${this.files[i].name} uploaded. wait to be redirected back! <br />`;
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
    db.collection("posts").add({
      posts: postObj,
    })
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        this.redirectToApp();
        this.$uploadContainer.style.display = "none";
        this.$app.style.display = "block";
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }

  fetchPostsFromDB() {
    db.collection("posts")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          const posts = postData.posts;
          this.posts = [...this.posts, ...posts];
          console.log(this.posts);
        });

        this.renderPosts(this.posts);
        

      })
      .catch((error) => {
        console.error("Error getting posts: ", error);
      });
  }
  


  renderPosts(posts) {
    const postContainer = document.querySelector("#post-container");

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");

      const profilePictureSrc = post.profilePicture ? post.profilePicture : '/assets/user-icon.jpeg';
      const isCurrentUserPost = post.username === this.user.displayName;

      const modalId = `optionsModal_${post.id}`;
      this.selectedPostId = post.id;

      postElement.innerHTML = `
        <div class="header">
          <div class="profile-area">
            <div class="post-pic">
              <img alt="${post.username}'s profile picture" class="_6q-tv" data-testid="user-avatar" draggable="false" src="${profilePictureSrc}" />
            </div>
            <span class="profile-name">${post.username}</span>
          </div>
          <div class="options" id="optionsButton">
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
          <img alt="Photo by ${post.username} on ${post.postDate}. ${post.imageDescription}" class="FFVAD" decoding="auto" sizes="614px" src="${post.fileUrl}" style="object-fit: cover" />
          <p class="liked">Liked by <span class="profile-name">ishitaaa.b</span> and <span class="profile-name">others</span></p>
       <p><span class="profile-name">${post.username}</span>  ${post.caption}</p>
        </div>
        <div class="footer">
          <div class="modal" id="${modalId}">
            <div class="modal-content">
              ${isCurrentUserPost
          ? `<a href="#" class="modal-option">Edit</a>
                   <hr />
                   <a href="#" class="modal-option delete">Delete</a>`
          : `<a href="#" class="modal-option">Report</a>
                   <hr />
                   <a href="#" class="modal-option">Unfollow</a>
                   <hr />
                   <a href="#" class="modal-option">Go to post</a>
                   <hr />
                   <a href="#" class="modal-option">Share to</a>
                   <hr />
                   <a href="#" class="modal-option">Embed</a>`}
              <hr />
              <a href="#" class="modal-option-cancel">Cancel</a>
            </div>
          </div>
        </div>
        <span class="comment">
        <span class="caption-username"><b>akhilboddu</b></span>
        <span class="caption-text">Thank you</span>
      </span>
      <span class="comment">
        <span class="caption-username"><b>imharjot</b></span>
        <span class="caption-text"> Great stuff</span>
      </span>
        <div class="add-comment">
          <input type="text" placeholder="Add a comment..." />
          <a class="post-btn">Post</a>
        </div>
      `;

      postContainer.appendChild(postElement);

      const optionsButton = postElement.querySelector("#optionsButton");
      const optionsModal = postElement.querySelector(`#${modalId}`);

      optionsButton.addEventListener("click", (event) => {
        event.preventDefault();
        console.log("Button clicked");

        optionsModal.style.display = "block";
      });

      const cancelOption = optionsModal.querySelector(".modal-content");
cancelOption.addEventListener("click", (event) => {
  event.preventDefault();
  optionsModal.style.display = "none";
});


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

  handleArchiving(event) {
    const $selectedPost = event.target.closest(".post");
    
    if ($selectedPost && event.target.closest(".delete")) {
      console.log("post id:", this.selectedPostId);
      this.selectedPostId = $selectedPost.id;
      this.deletePost(this.selectedPostId);
      this.RemoveFromDB();
    } else {
      return;
    }
  }

  deletePost(id) {
    this.posts = this.posts.filter((post) => post.id !== id );
  
  }




}

const app = new App();