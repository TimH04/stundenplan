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
		url: "https://sandbox.gibm.ch/berufe.php",
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
	let classUrl = "https://sandbox.gibm.ch/klassen.php";
	if (localStorage.getItem("group")) {
		classUrl +=
			"?beruf_id=" + localStorage.getItem("group");

		await $.ajax({
			url: classUrl,
			success: function (result) {
				if (result != null) {
					// loop over the data
					$("#dropdown-class").removeClass("invisible");
					$("#dropdown-class-label").removeClass(
						"invisible"
					);
					$("#dropdown-class").append(
						"<option hidden disabled selected value> -- Klasse auswählen -- </option>					"
					);

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
	}
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
		getData();
	}
});
$("#dropdown-group").change(function () {
	localStorage.setItem("group", this.value);
	// get classes of profession
	$.ajax({
		url:
			"https://sandbox.gibm.ch/klassen.php?beruf_id=" +
			this.value,
		success: function (result) {
			if (result != null) {
				// reset the dropdown
				$("#dropdown-class").html("");
				$("#dropdown-class").append(
					"<option hidden disabled selected value> -- Klasse auswählen -- </option>					"
				);
				$("#dropdown-class").removeClass("invisible");
				$("#pagination").html("");
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
async function getData(state) {
	// get selected option

	let selectedOption = $(
		"#dropdown-class option:selected"
	).val();
	// get timetable of selected class
	$.ajax({
		url:
			"https://sandbox.gibm.ch/tafel.php?klasse_id=" +
			selectedOption +
			"&woche=" +
			dateString,
		success: function (result) {
			if (result.length != 0) {
				$("#table-div").removeClass("invisible");
				$("#table-body").html("");
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
					let row =
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
					$("#table-body").append(row);
				});
				if (state != null && state == "add") {
					document
						.getElementById("table")
						.classList.add("animated", "fadeInRight");
				} else if (state == "sub") {
					document
						.getElementById("table")
						.classList.add("animated", "fadeInLeft");
				}
			} else {
				$("#data").html(
					`<br><div class="alert alert-danger" role="alert">
			Für diese Woche gibt es keine geplanten Stunden.
		  </div>`
				);
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
	getData("add");
}
function subOneWeek() {
	date.setDate(date.getDate() - 7);
	calculateWeekString(date);
	getData("sub");
}
