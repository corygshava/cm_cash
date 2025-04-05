var thepref_transactions = 'cmcash_transactions_[uid00]';
var thepref_color = "cmcash_settings_color";
var thepref_mode = "cmcash_settings_mode";
var thepref_dailylimit = "cmcash_settings_dailylimit";

var sys_passwird = "shava4life";
var appname = "GashMan";
var pagename = "";

var today = new Date();

function setupnav() {
	// an array of links plus pages they link to plus captions
	let links = [
		{link: "index.html",caption: "summary",icon: "dashboard"},
		{link: "trx.html",caption: "transactions",icon: "exchange"},
		{link: "new_trx.html",caption: "add",icon: "plus"},
		{link: "settings.html",caption: "settings",icon: "cog"}
	]
	// get nav

	let thenav = document.querySelector("nav");

	if(thenav != undefined){
		// add links one by one
		// append to the nav
		thenav.innerHTML = "";

		links.forEach(el => {
			let xtra = el.caption == pagename ? "active" : "";
			thenav.innerHTML += `<a href="${el.link}" class="navlink ${xtra}"><i class="fa fa-${el.icon}"></i> ${el.caption}</a>`;
		})

		thenav.animate([
			{opacity:0},
			{opacity:1}
		],{
			duration: 300,
			easing: "ease-out"
		})
	}
}

function getpref(pref,dft) {
	let what = localStorage.getItem(pref);
	// console.log(what,dft);

	dft = dft == null ? 'nada' : dft;
	what = what == null ? dft : what;

	// console.log(what)
	return what;
}

// load settings
function loadsettings() {
	pickmode();
	pickcolor();
}

function pickmode() {
	// get mode from storage
	// update the body to match
	let themode = getpref(thepref_mode,"light");

	document.body.dataset.mode = themode;
}

function pickcolor(){
	let thecol = getpref(thepref_color,`${getRandomColor()}`);
	document.body.style.setProperty('--themecolor',thecol);
}

// change settings

function toggleMode() {
	let themode = localStorage.getItem(thepref_mode);
	let newmode = "light";
	
	themode = themode == null ? "light" : themode;
	newmode = themode != newmode ? newmode : "dark";
	
	localStorage.setItem(thepref_mode,newmode);
	// alert(themode);

	pickmode();
}

function setThemecolor(col){
	localStorage.setItem(thepref_color,`${col}`);

	pickcolor();
}

function deleteAllData() {
	localStorage.removeItem(thepref_transactions);
	localStorage.removeItem(thepref_color);
	localStorage.removeItem(thepref_mode);

	alert('system has been reset, hope you made a backup somewhere 😒');
	window.location.reload();
}

// reusables
function reverseformatDate(mydate) {
	// from yr-d-m to m/d/y
	let thadate = mydate;
	let dd = thadate.split("-");
	return `${dd[1].padStart(2,"0")}/${dd[2].padStart(2,"0")}/${dd[0].padStart(2,"0")}`;
}

function reformatDate(mydate) {
	// from m/d/y to yr-d-m
	let thadate = mydate.toLocaleDateString();
	let dd = thadate.split("/");
	return `${dd[2].padStart(2,"0")}-${dd[0].padStart(2,"0")}-${dd[1].padStart(2,"0")}`;
}

// initialisers
window.onload = () => {
	loadsettings();
	setupnav();
}