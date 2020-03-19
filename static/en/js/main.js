// Main JS file used by every page
'use strict';

/********************************/
// Parts functions
/********************************/

// Automates the flipping of hamburgers. Wish I'd had this earlier in college!
function toggleBurger() {
    document.getElementsByClassName("navlist")[0].classList.toggle("responsive");
}
