// ======================================
// LOGIN FUNCTION
// ======================================

window.login = async function(){

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const result = await window.api.login({ username, password });

    if(result.success){

        // store logged-in user
        window.currentUser = result.user;

        // hide login screen
        document.getElementById("loginScreen").style.display = "none";

        // show POS
        document.getElementById("appLayout").classList.remove("hidden");

        const userDisplay = document.getElementById("currentUserDisplay");

            if(userDisplay){
                userDisplay.innerText = result.user.username;
            }

        showSuccess("Welcome " + result.user.username);

        // focus search immediately
        setTimeout(()=>{
            const search = document.getElementById("searchInput");
            if(search) search.focus();
        },100);

    }else{

        document.getElementById("loginError").innerText =
            "Invalid credentials";

    }

};

window.logout = function(){

    const modal = document.getElementById("logoutModal");

    if(modal){
        modal.classList.remove("hidden");
    }

};

window.closeLogoutModal = function(){
    document
    .getElementById("logoutModal")
    .classList.add("hidden");
};


window.confirmLogout = function(){

    // close modal first
    closeLogoutModal();

    // CLOSE ALL MODALS (safety)
    document.querySelectorAll(".modal").forEach(m=>{
        m.classList.add("hidden");
    });

    // RESET APP UI
    document.getElementById("appLayout").classList.add("hidden");
    document.getElementById("loginScreen").style.display = "flex";

    // CLEAR INPUTS
    const user = document.getElementById("loginUsername");
    const pass = document.getElementById("loginPassword");

    user.value = "";
    pass.value = "";

    // CLEAR SESSION
    window.currentUser = null;

    // FOCUS INPUT
    setTimeout(()=>{
        user.focus();
    },100);

};