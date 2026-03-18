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

        showAlert("Welcome " + result.user.username);

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