let dateString;
let date = new Date();
// calculate the new week string for the api
function calculateWeekString(currentDate) {
	let startDate = new Date(currentDate.getFullYear(), 0, 1);
	var days = Math.floor(
		(currentDate - startDate) / (24 * 60 * 60 * 1000)
	);
	var weekNumber = Math.ceil(days / 7);
	dateString = weekNumber + "-" + currentDate.getFullYear();
}
calculateWeekString(new Date());
$(document).ready(async function () {
	// get the berufe data from the api
	await $.ajax({
		url: "http://sandbox.gibm.ch/berufe.php",
		success: function (result) {
			if (result != null) {
				// loop over the data
				result.forEach((x) => {
					// append each element from the array as a option to the dropdown
					$("#dropdown-group").append(
						'<option value="' +
							x.beruf_id +
							'">' +
							x.beruf_name +
							"</option>"
					);
				});
			} else {
				alert("Leider gibt es aktuell keine Daten.");
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert(
				"API ist aktuell nicht erreichbar. Bitte probieren Sie es später erneut"
			);
		},
	});
	// get the classes
	let classUrl = "http://sandbox.gibm.ch/klassen.php";
	if (localStorage.getItem("group")) {
		classUrl +=
			"?beruf_id=" + localStorage.getItem("group");
	}

	await $.ajax({
		url: classUrl,
		success: function (result) {
			if (result != null) {
				// loop over the data
				result.forEach((x) => {
					// append each element from the array as a option to the dropdown
					$("#dropdown-class").append(
						'<option value="' +
							x.klasse_id +
							'">' +
							x.klasse_name +
							"</option>"
					);
				});
			} else {
				alert("Leider gibt es aktuell keine Daten.");
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert(
				"API ist aktuell nicht erreichbar. Bitte probieren Sie es später erneut"
			);
		},
	});
	// check local storage
	if (
		localStorage.getItem("class") &&
		localStorage.getItem("group")
	) {
		// get all dropdown options
		let children = document.getElementById(
			"dropdown-class"
		).children;
		// loop over the childs
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			// check value and the localstorage item
			if (child.value === localStorage.getItem("class")) {
				// select option
				document.getElementById(
					"dropdown-class"
				).selectedIndex = i;
			}
		}
		// get all dropdown options
		children = document.getElementById(
			"dropdown-group"
		).children;
		// loop over the childs
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			// check value and the localstorage item
			if (child.value === localStorage.getItem("group")) {
				// select option
				document.getElementById(
					"dropdown-group"
				).selectedIndex = i;
			}
		}
	}
	getData();
});
$("#dropdown-group").change(function () {
	localStorage.setItem("group", this.value);
	// get classes of profession
	$.ajax({
		url:
			"http://sandbox.gibm.ch/klassen.php?beruf_id=" +
			this.value,
		success: function (result) {
			if (result != null) {
				// reset the dropdown
				$("#dropdown-class").html("");
				result.forEach((x) => {
					// append each element from the array as a option to the dropdown
					$("#dropdown-class").append(
						'<option value="' +
							x.klasse_id +
							'">' +
							x.klasse_name +
							"</option>"
					);
				});
			} else {
				alert("Leider gibt es aktuell keine Daten.");
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert(
				"API ist aktuell nicht erreichbar. Bitte probieren Sie es später erneut"
			);
		},
	});
});
$("#dropdown-class").change(function () {
	// get selected option
	let selectedOption = $(
		"#dropdown-class option:selected"
	).val();
	// set value of selected option to localstorage
	localStorage.setItem("class", selectedOption);

	getData();
});
async function getData() {
	// get selected option

	let selectedOption = $(
		"#dropdown-class option:selected"
	).val();
	// get timetable of selected class
	$.ajax({
		url:
			"http://sandbox.gibm.ch/tafel.php?klasse_id=" +
			selectedOption +
			"&woche=" +
			dateString,
		success: function (result) {
			if (result != null) {
				let rows = "";
				// loop over lessons
				result.forEach((x) => {
					let wochentag = "";
					// get weekday as a word
					switch (x.tafel_wochentag) {
						case "1":
							wochentag = "Montag";
							break;
						case "2":
							wochentag = "Dienstag";
							break;
						case "3":
							wochentag = "Mittwoch";
							break;
						case "4":
							wochentag = "Donnerstag";
							break;
						case "5":
							wochentag = "Freitag";
							break;
						case "6":
							wochentag = "Samstag";
							break;
						case "7":
							wochentag = "Sonntag";
							break;
					}
					// add the table row to the string
					rows +=
						"<tr><td>" +
						x.tafel_datum +
						"</td>" +
						"<td>" +
						wochentag +
						"</td>" +
						"<td>" +
						x.tafel_von +
						"</td>" +
						"<td>" +
						x.tafel_bis +
						"</td>" +
						"<td>" +
						x.tafel_longfach +
						"</td>" +
						"<td>" +
						x.tafel_lehrer +
						"</td>" +
						"<td>" +
						x.tafel_raum +
						"</td>" +
						"</tr>";
				});
				// conconate the table string and the pagination
				$("#data").html(
					`<div class="table-responsive"><table class='table'><thead<tr> 
						<th>Datum</th><th>Wochentag</th><th>Von</th><th>Bis</th><th>Lehrer</th><th>Fach</th><th>Raum</th></tr> </thead> 
						${rows}
						</table></div> ` +
						'<ul class="pagination align-items-center justify-content-center">' +
						`<li class="page-item">
					  <button class="page-link" href="#" onClick="subOneWeek()" aria-label="Previous">
						<span aria-hidden="true">&laquo;</span>
						<span class="sr-only">Previous</span>
					  </button>
					</li>
					<li class="page-item"><a class="page-link" href="#">${dateString}</a></li>
					
					<li class="page-item">
					  <button onClick="addOneWeek()" class="page-link" href="#" aria-label="Next">
						<span aria-hidden="true">&raquo;</span>
						<span class="sr-only">Next</span>
					  </button>
					</li>
				  </ul>`
				);
			} else {
				alert("Leider gibt es aktuell keine Daten.");
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			alert(
				"API ist aktuell nicht erreichbar. Bitte probieren Sie es später erneut"
			);
		},
	});
}
function addOneWeek() {
	date.setDate(date.getDate() + 7);
	calculateWeekString(date);
	getData();
}
function subOneWeek() {
	date.setDate(date.getDate() - 7);
	calculateWeekString(date);
	getData();
}
