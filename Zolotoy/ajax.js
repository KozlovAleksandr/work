<script>
function getTasks(searchParam) {
	sStatusID = searchParam === "future" ? searchParam : "";
	console.log(sStatusID)
	$.ajax({
		type: "POST",
		url: "/pp/Ext5/extjs_json_collection_data.html",
		dataType: "json",
		data:   {
					"collection_code" : "GetToDo",
					"parameters" : `iDaysToShow=365;sStatus=${sStatusID};bShowCourses=true;bShowTests=true;bShowEventConfirmation=true`,
				},
		success: function (data) {
			result = data.results;
			console.log("RESULT2_", result);
			printTasks(result);
		},
	})
}

function printTasks(tasksArray) {
	$("tbody").empty();
	for (i in tasksArray) {
		$("tbody")
			.append($(`
				<tr>
					<th scope="row">${tasksArray[i].name}</th>
					<td>${tasksArray[i].state}</td>
					<td>${tasksArray[i].strDate}</td>
					<td>${tasksArray[i].type_name}</td>
				</tr>
			`))
		;
	}
}

{/* function filterTasks(tasksArray, searchParam) {
	switch( searchParam ) {
		case "exceeded":
			result = tasksArray.filter(task => task.exceeded);
			printTasks(result);
			break;
		case "critical":
			result = tasksArray.filter(task => (task.critical && !task.exceeded));
			printTasks (result);
			break;
		case "future":
			result = tasksArray.filter(task => (!task.critical && !task.exceeded));
			printTasks (result);
			break;
	}		
} */}

function getNews() {
	$.ajax({
		type: "POST",
		url: "/pp/Ext5/extjs_json_collection_data.html",
		dataType: "json",
		data:   {
					"collection_code" : "GetDocumentSubsections",
					"parameters" : "iDocumentID=6821888173484432079;bCheckAccess=false;bShowExtendedData=true;sSortType=name;sPeriod=day",
				},
		success: function (data) {
			result = data.results;
			console.log("RESULT3", result);
			$(".slider__items").css("width", `${result.length * 346.66}`)
			for (i in result) {
				$(".itc-slider-2 .itc-slider__items")
					.append($(`<a class='itc-slider__item slider__item' 
						style='background-image: url(${result[i].image})'
						href=${result[i].link}>
					`));
				$(".itc-slider__indicators .itc-slider__indicators-2")
					.append($(`
						<li class="itc-slider__indicator" data-slide-to="${i}"></li>
					`))
			}
		},
	})
}


function fnLoadData() {
	console.log(WTLP.sObjectId);

	$.ajax({
		type: "POST",
		url: "/pp/Ext5/extjs_json_collection_data.html",
		dataType: "json",
		data:   {
					"collection_code" : "zolotoy_common_collection",
					"parameters" : "userid=" + WTLP.sObjectId,					
				},
		success: function (data) {
			result = data.results[0];
			console.log("RESULT1", result);
			avatarUrl = result.avatar;
			if (avatarUrl == "") {
				if (result.sex === "m") {
					$(".photo_man").css("display", "block");
					$(".photo").css("display", "none");
				} else if (result.sex === "m") {
					$(".photo_woman").css("display", "block");
					$(".photo").css("display", "none");
				}
			} else {
				$(".avatar").attr("src", avatarUrl);
			}
			$(".top-block__left-name").text(result.name);
			$(".top-block__left-position").text(result.position);
			$(".experience").text(result.experience);
			$(".new-courses_slider").css("width", `${result.newCourses.length * 518}`)
			console.log("RESULT4", result.newCourses)
			for (a in result.newCourses) {
				$(".itc-slider-1 .itc-slider__items")
					.append($(`
						<div class="itc-slider__item">
							<div class="new-courses-button-block-item">
								<div class="button-block-item-image">
									<div class="title">${result.newCourses[a].name}</div>
									<div class="new-courses_logo">
										<img src="${result.newCourses[a].imgURL}" alt="">
									</div>
								</div>
								<div class="button-block-item-info">
									<p class="desс">${result.newCourses[a].descr}</p>
									<a href="${result.newCourses[a].url}" class="button">Пройти</a>
								</div>			
							</div>
						</div>
					`));
				$(".itc-slider__indicators .itc-slider__indicators-1")
					.append($(`
						<li class="itc-slider__indicator" data-slide-to="${a}"></li>
					`))
			}
		}
	})

	getTasks()

	$(".current_tasks").click(function() {
		getTasks("current")
	});
	$(".coming_tasks").click(function() {
		getTasks("future")
	});

	$(".completed_tasks").click(function() {
		getTasks("")
	});

	getNews()
}		

$(document).ready(fnLoadData);
</script>

