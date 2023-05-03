let dateString;
function calculateWeekString(currentDate) {
	let startDate = new Date(currentDate.getFullYear(), 0, 1);
	var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
	var weekNumber = Math.ceil(days / 7);
	dateString = weekNumber + "-" + currentDate.getFullYear();
}
calculateWeekString(new Date());
$(document).ready(function () {
	$.ajax({
		url: "http://sandbox.gibm.ch/berufe.php",
		success: function (result) {
			if (result != null) {
				console.log(result);
				result.forEach((x) => {
					$("#dropdown-group").append(
						'<option value="' +
							x.beruf_id +
							'">' +
							x.beruf_name +
							"</option>"
					);
				});
			}
		},
	});
	$.ajax({
		url: "http://sandbox.gibm.ch/klassen.php",
		success: function (result) {
			if (result != null) {
				result.forEach((x) => {
					$("#dropdown-class").append(
						'<option value="' +
							x.klasse_id +
							'">' +
							x.klasse_name +
							"</option>"
					);
				});
			}
		},
	});
});
$("#dropdown-group").change(function () {
	$.ajax({
		url: "http://sandbox.gibm.ch/klassen.php?beruf_id=" + this.value,
		success: function (result) {
			if (result != null) {
				$("#dropdown-class").html("");
				result.forEach((x) => {
					$("#dropdown-class").append(
						'<option value="' +
							x.klasse_id +
							'">' +
							x.klasse_name +
							"</option>"
					);
				});
			}
		},
	});
});
$("#dropdown-class").change(function () {
	getData();
});
async function getData() {
	let selectedOption = $("#dropdown-class option:selected").val();
	console.log(selectedOption);
	$.ajax({
		url:
			"http://sandbox.gibm.ch/tafel.php?klasse_id=" +
			selectedOption +
			"&woche=" +
			dateString,
		success: function (result) {
			if (result != null) {
				console.log(result);
				let rows = "";
				result.forEach((x) => {
					let wochentag = "";
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
						"<td>" +
						x.tafel_kommentar +
						"</td> </tr>";
				});
				$("#data").html(
					"<table class='table'><tr>" +
						"<th>Datum</th><th>Wochentag</th><th>Von</th><th>Bis</th><th>Lehrer</th><th>Fach</th><th>Raum</th></tr> " +
						rows +
						+"</table>" +
						'<ul class="pagination">' +
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
			}
		},
	});
}
function addOneWeek() {
	let date = new Date();
	date.setDate(date.getDate() + 7);
	calculateWeekString(date);
	getData();
}
function subOneWeek() {
	let date = new Date();
	date.setDate(date.getDate() - 7);
	calculateWeekString(date);
	getData();
}
