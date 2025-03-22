// new trx compo
var showpage = "trx.html";
let thedata = undefined;
let weeklimits = [];

function gettrxs() {
	let thetransactions = getpref(thepref_transactions,'[]');
	thedata = JSON.parse(thetransactions);
}

function showtrx(holder,amt,placeholder,reverse) {
	gettrxs();

	reverse = reverse == undefined ? false : reverse;

	let tempdata = reverse ? thedata.reverse() : thedata;
	let touse = tempdata;

	amt = "" + amt;
	placeholder = placeholder == undefined ? "no transactions found" : placeholder;

	if(thedata.length == 0){
		holder.innerHTML = `
			<div class="nada">
                <i>${placeholder}</i>
				<a class="themebtn" href="new_trx.html"><i class="fa fa-plus"></i> add new</a>
            </div>
		`;

		return;
	}

	if(amt == "all" || amt == "*"){
		holder.innerHTML = `
			<div class="nada">
                <i>Showing all transactions</i>
            </div>
		`;
	} else {
		let limit = Number(amt);

		if(isNaN(limit)){
			console.logError('USE A VALID NUMBER!!! or accepted keywords');
			return;
		}

		touse = tempdata.splice(0,limit);
	}

	holder.innerHTML = `<div class="w3-center"><b>showing <b>${touse.length}</b> ${plural('transaction',touse.length)}</b></div>`;

	// render the transactions
	touse.forEach((el,id) => {
		let ver = el.t_type == "income" ? "in|up" : "out|down";

		holder.innerHTML += `
			<div class="item ${ver.split("|")[0]}">
				<div class="w3-right thecash">
					<span class="currency">${el.t_amt}</span>
				</div>
				<div class="desc">
					<button class="icon"><i class="fa fa-arrow-${ver.split("|")[1]}"></i></button>
					<div class="summ">
						<span class="descTxt">${el.t_desc}</span><br>
						<span class="date halftone">${el.t_date}</span>
					</div>
				</div>
			</div>
		`;
	});
}

function new_trx() {
	gettrxs();

	if(daform == undefined){console.error('the form cant be undefined');return;}

	let t_type = daform.t_type.value;
	let t_amt = daform.theamt.value;
	let t_desc = daform.thedesc.value;
	let t_date = daform.thedate.value;
	let t_note = daform.thenote.value;
	let t_timeblock = new Date();

	t_timeblock = t_timeblock.getTime();

	// con

	t_note = t_note.replaceAll('\n','<br>').replaceAll('"',"'");

	let saveObj = {
		't_type' : t_type,
		't_amt' : t_amt,
		't_desc' : t_desc.replaceAll('"',"'"),
		't_date' : t_date,
		't_note' : t_note.replaceAll('"',"'").replaceAll("\n","<br>"),
		't_timestamp' : t_timeblock
	}

	let trxs = thedata.filter(el => true);

	trxs.push(saveObj);

	let tosave = JSON.stringify(trxs);
	localStorage.setItem(thepref_transactions,tosave);

	window.location.assign(showpage);

	// console.log(saveObj);
}

function getbalance() {
	gettrxs();

	let trxs = thedata;
	let intrx = trxs.filter(m => m.t_type == "income");
	let outtrx = trxs.filter(m => m.t_type == "expense");

	let insum = 0;
	let outsum = 0;

	intrx.forEach(el => {insum += Number(el.t_amt)});
	outtrx.forEach(el => {outsum += Number(el.t_amt)});

	let balance = insum - outsum;
	return balance;
}

function getexpense(date) {
	gettrxs();

	let total = 0;
	let mdata = thedata;

	mdata.forEach(el => {
		if(el.t_type == "expense" && el.t_date == date){
			total += Number(el.t_amt);
		}
	})

	return total;
}

function getearnings(date) {
	gettrxs();

	let total = 0;
	let mdata = thedata;

	mdata.forEach((el,id) => {
		if(el.t_type == "income" && el.t_date == date){
			total += Number(el.t_amt);
		}
	})

	return total;
}

function getdayly(date) {
	return weeklimits[date.getDay()];
}

function getWeeklyCashReport(date){
	let taday = date == undefined ? new Date() : date;
	let curday = taday.getDay();
	let mill = 86400 * 1000;
	let dates = [];
	let expenses = [];
	let earnings = [];

	for(let x = 0;x < 7;x++){
		// mills to deduct
		let md = (curday - x) * mill;

		// get the expenses of that date
		let tempdate = new Date(taday.getTime() - md);
		let wanted = reformatDate(tempdate);

		// add to dates array
		dates[x] = wanted;
		expenses[x] = getexpense(wanted);
		earnings[x] = getearnings(wanted);
	}

	console.log(dates,expenses,earnings);

	let temp_expe = expenses.filter(el => {return el != 0});
	let temp_earn = earnings.filter(el => {return el != 0});

	let maxexpe = getmax(temp_expe);
	let maxearn = getmax(temp_earn);
	let minexpe = getmin(temp_expe);
	let minearn = getmin(temp_earn);

	console.log(`highest expense: ${maxexpe}, highest income: ${maxearn}`);
	console.log(`lowest expense: ${minexpe}, lowest income: ${minearn}`);

	// returns an object with all the data
	let outdata = {
		'w_dates' : dates,
		'w_expenses' : expenses,
		'w_income' : earnings,
		'w_maxspend' : maxexpe,
		'w_maxearn' : maxearn,
		'w_minspend' : minexpe,
		'w_minearn' : minearn
	}

	console.log(outdata);

	return outdata;
}

function getWeekLimits() {
	// read the pref
	let pld = getpref(thepref_dailylimit,"[]");

	// parse it with JSON
	let tempdata = JSON.parse(pld);

	
	// set it to weeklimits
	if(pld == "[]"){
		makedummies_limits();
	} else {
		weeklimits = tempdata;
	}
}

function makedummies_limits(live) {
	weeklimits = [];

	for (let x = 0; x < 7; x++) {
		weeklimits[x] = live ? 0 : Math.floor(Math.random() * 200);
	}
}

function exportData() {
	/* get
		thepref_transactions
		thepref_color
		thepref_mode
		thepref_dailylimit
	*/

	let finalObj = {
		transactions : JSON.parse(getpref(thepref_transactions,"[]")),
		color : getpref(thepref_color,"dodgerblue"),
		mode : getpref(thepref_mode,"dark"),
		dailylimit : JSON.parse(getpref(thepref_dailylimit,"[]"))
	};

	let outdata = JSON.stringify(finalObj);
	let thefile = new Blob([outdata],{type: 'application/json'});
	let url = URL.createObjectURL(thefile);
	let thelink = document.createElement('a');

	thelink.classList.add('themebtn');
	thelink.innerHTML = "get my data";
	thelink.href = url;
	thelink.download = `${appname}_[${reformatDate(today)}]_data.json`;

	// document.body.appendChild(thelink);
	
	setTimeout(() => {
		thelink.click();
		// document.removeChild(thelink);
	},300);

	console.log(finalObj);
}