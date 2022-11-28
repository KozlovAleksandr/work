<%
	var tenancy_name = tools.get_thread_tenancy_name();

___doc = OpenDoc(UrlFromDocID(OptInt(curUserID, 0)));
Session.SetProperty("notification_needed", false);

function isCategory(category) {
    return (ArrayOptFind(___doc.TopElem.category_id, "This == '" + category + "'") != undefined ? true : false);
}

___str = "for $elem in collaborators";
___str += " where $elem/id = " + curUserID;
___str += " and $elem/role_id = 'admin'";
___str += " return $elem";
admin_el = ArrayOptFirstElem(XQuery(___str));

is_sc_expert = isCategory("sc_expert");
is_contractor = isCategory("contractor");
is_development_manager = isCategory("development_manager");
is_r_and_d_manager = isCategory("r_and_d_manager");
is_hse_manager = isCategory("hse_manager");
is_role_admin = (admin_el != undefined ? true : false);
is_lector = ArrayOptFirstElem(XQuery("for $elem in lectors where $elem/person_id = " + curUserID + " return $elem")) != undefined;

groupID = 7165557768812309080;  // Группа ознакомления
groupDoc = OpenDoc(UrlFromDocID( groupID )).TopElem;
is_Access = ArrayOptFind(groupDoc.collaborators, "This.collaborator_id == "+ curUserID) != undefined;


sql = Array(
    'sql: ',
    'SELECT',
    '	(XPATH(\'/lector/custom_elems/custom_elem[name=\'\'is_chak\'\']/value/text()\', "lc"."data"))[1]::text "chak"',
    'FROM',
    '	"' + tenancy_name + '"."lectors" "ls"',
    '	INNER JOIN "' + tenancy_name + '"."lector" AS "lc"',
    '		 ON "lc"."id" = "ls"."id"',
    'WHERE',
    '	"ls"."person_id" = ' + curUserID
).join("\r\n");

is_chak = ArrayOptFirstElem(XQuery(sql), { chak: { Value: false } }).chak.Value == 'true';

var list_profile_role = (is_sc_expert
    || is_development_manager
    || is_r_and_d_manager
    || is_hse_manager
    || is_role_admin
    || is_contractor);

function get_user_role() {
    if (curUser.category_id.ByValueExists("contractor") || ArrayOptFirstElem(XQuery("for $elem in collaborators where id = " + curUserID + " and role_id = 'admin' return $elem")) != undefined) {
        return "contractor";
    }
    else if (curUser.category_id.ByValueExists("sc_expert")) {
        return "sc";
    }
    else if (ArrayOptFirstElem(XQuery("for $elem in func_managers where $elem/catalog = 'collaborator' and $elem/is_native = true() and $elem/person_id= " + curUserID + " return $elem")) != undefined) {
        return "func_manager";
    }
    else {
        return "";
    }
}

function get_training_program_validation_link() {
    var link = "/view_doc.html?mode=my_training_program_validation";

    try {
        var sql = [
            'SELECT',
            '	"cp"."id" AS "id"',
            'FROM',
            '	"' + tenancy_name + '"."cc_mars_tp_adjustment_logs" AS "log"',
            '	INNER JOIN "' + tenancy_name + '"."collaborators" AS "coll" ON "coll"."id" = ' + curUserID + ' AND "coll"."id" = "log"."collaborator_id"',
            '	INNER JOIN "' + tenancy_name + '"."compound_programs" AS "cp" ON "cp"."id" = "log"."training_program_id"',
            'WHERE',
            '	"log"."status" NOT IN (N\'Не проверена в предыдущий раз\', N\'Тренинг-программа проверена\') AND "log"."is_checked" != true',
            'LIMIT 2',
        ];

        var result = XQuery("sql: " + sql.join("\r\n"));

        if (ArrayCount(result) == 1) {
            link = "/view_doc.html?mode=training_program_edit&object_id=" + OptInt(ArrayOptFirstElem(result).id.Value);
        }
        else if (ArrayCount(result) == 0) {
            link = "";
        }
    }
    catch (ex) {

    }

    return link;
}

var training_program_validation_link = get_training_program_validation_link();

var __role = get_user_role();
var ___roles_list = ["func_manager", "sc", "contractor"];

var qual_level_access = {
    role: __role,
    access: (ArrayOptFind(___roles_list, "This == " + XQueryLiteral(__role)) != undefined)
};

var assessment_control_links = [];
var bIsMse = curUser.category_id.ByValueExists('mse');
__courses_num = ArrayCount(XQuery("for $elem in active_learnings where $elem/person_id = " + curUserID + " return $elem"));
__tests_num = ArrayCount(XQuery("for $elem in active_test_learnings where $elem/person_id = " + curUserID + " return $elem"));

__poll_procedure_count = ArrayCount(XQuery("for $elem in poll_results where $elem/person_id = " + curUserID + " return $elem"));
Session.SetProperty("poll_procedure_count", __poll_procedure_count);

__doc_about_template = ArrayOptFirstElem(XQuery("for $elem in documents where $elem/code='about_portal' return $elem"), { template: { Value: "#" } }).template.Value;

__style = "";
__pict_url = ArrayOptFirstElem(XQuery("for $elem in collaborators where $elem/id = " + curUserID + " return $elem"), { pict_url: { Value: "" } }).pict_url.Value;

if (__pict_url != "") {
    __style = "background-image: url(" + __pict_url + ")";
}
if (Session.HasProperty("access_to_reports") && Session.access_to_reports != undefined) {
    access_to_reports = Session.access_to_reports;
}
else {
    access_to_reports = false;

    if (is_contractor || curUser.access.access_role == "admin" || curUser.category_id.ByValueExists('sc_expert') || bIsMse) {
        access_to_reports = true;
    }

    Session.access_to_reports = access_to_reports;
}

if (access_to_reports && !is_contractor && !bIsMse) {
    assessment_control_links.push({
        link: "/view_doc.html?mode=mars_test_list",
        name: "Список тестов"
    });

    assessment_control_links.push({
        link: "/view_doc.html?mode=access_matrix_test",
        name: "Матрица доступа"
    });

    if (curUser.access.access_role.Value === "admin" || curUser.category_id.ByValueExists('development_manager') || curUser.category_id.ByValueExists('sc_expert')) {
        assessment_control_links.push({
            link: "/view_doc.html?mode=test_validation",
            name: "Проверка тестов"
        });
    }
}
else if (!is_contractor) {
    if (curUser.access.access_role.Value === "admin" || curUser.category_id.ByValueExists('development_manager') || curUser.category_id.ByValueExists('sc_expert')) {
        assessment_control_links.push({
            link: "/view_doc.html?mode=test_validation",
            name: "Проверка тестов"
        });
    }

    sql = Array(
        'sql:',
        'SELECT',
        '	"ams"."id"',
        'FROM',
        '	"' + tenancy_name + '"."cc_mars_access_matrixs" "ams"',
        '	WHERE',
        '		"ams"."collaborator_id" = ' + curUserID + '',
        '		AND "ams"."is_view" = true'
    ).join("\r\n");

    if (ArrayOptFirstElem(XQuery(sql)) != undefined) {
        assessment_control_links.push({
            link: "/view_doc.html?mode=mars_test_list",
            name: "Список&nbsp;тестов"
        });
    }
}

if (curUser.category_id.ByValueExists("owner_test") && ArrayOptFirstElem(XQuery("for $elem in cc_mars_test_adjustment_logs where $elem/collaborator_id = " + curUserID + " and $elem/is_checked != true() and MatchSome($elem/status, ('Уведомлен', 'Выслано напоминание', 'Проверка просрочена')) return $elem")) != undefined) {
    assessment_control_links.push({
        link: "/view_doc.html?mode=my_test_validation",
        name: "Тесты&nbsp;для проверки"
    });
}

assessment_control_links = ArraySelectDistinct(assessment_control_links, "This.link");

if (!Session.HasProperty("has_poll_procedure")) {
    __has_poll_procedure = ArrayCount(XQuery("for $elem in poll_results where $elem/person_id = " + curUserID + " and $elem/is_done = false() return $elem")) > 0;
    Session.SetProperty("has_poll_procedure", __has_poll_procedure);
}

if (!Session.HasProperty("poll_procedure_id")) {
    // код отзыва mars_1
    __poll_id = ArrayOptFirstElem(XQuery("for $elem in poll_procedures where $elem/code= 'mars_1' return $elem"), { id: { Value: 0 } }).id.Value;
    Session.SetProperty("poll_procedure_id", __poll_id);
}

sql_polls = Array(
    'sql: ',
    'SELECT DISTINCT',
    '	"res"."poll_id" AS "id",',
    '	"res"."status" AS "status",',
    '	"res"."name" AS "name"',
    'FROM ',
    '	"' + tenancy_name + '"."poll_results" AS "res"',
    '	INNER JOIN "' + tenancy_name + '"."polls" AS "p" ON "p"."id" = "res"."poll_id"',
    'WHERE',
    '	"res"."person_id" = ' + curUserID,
    '	AND "res"."is_done" != true',
    '	AND "res"."status" IN (0, 1)',
    '	AND "p"."code" ILIKE N\'self_rating_%\''
).join("\r\n");

__polls = XQuery(sql_polls);
__polls_num = ArrayCount(__polls);

__access_to_polls = false;

if (__polls_num != 0) {
    __access_to_polls = true;
    __polls_link_id = ArrayOptFirstElem(__polls).id.Value;
}

_responses_arr = XQuery("for $elem in responses, $rt in response_types where $elem/response_type_id = $rt/id and ( $rt/code = 'course_feedback'  or $rt/code = 'mars_feedback_test' or $rt/code = 'mars_feedback_training' or $rt/code = 'mars_feedback_distance_learning' ) and $elem/person_id=" + curUserID + " return $elem");
__responses_count = 0;
if (ArrayOptFirstElem(_responses_arr) != undefined) {
    for (elem in _responses_arr) {
        __doc = OpenDoc(UrlFromDocID(elem.id));

        if (__doc.TopElem.custom_elems.ObtainChildByKey("is_done").value != 'true') {
            __responses_count++;
        }
    }

    Session.SetProperty("unfinished_responses_count", __responses_count);
}
else {
    Session.SetProperty("unfinished_responses_count", 0);
}

if (ArrayOptFirstElem(_responses_arr) != undefined) {
    Session.SetProperty("notification_needed", true);
}

//доступ на страницу Панель руководителя
str = "for $m in func_managers,";
str += " $b in boss_types";
str += " where $m/boss_type_id = $b/id";
str += " and $b/code = 'main'";
str += " and $m/catalog = 'collaborator'";
str += " and $m/person_id = " + curUserID;
str += " and $m/object_id != null()";
str += " return $m";

Session.SetProperty("is_LM", (ArrayCount(XQuery(str)) > 0 ? true : false));

// Если не руководитель, то смотрим по другим критериям
if (!Session.is_LM && !Session.HasProperty("is_AS") && !Session.HasProperty("is_S") && !Session.HasProperty("has_FM")) {
    curUserDoc = OpenDoc(UrlFromDocID(curUserID)).TopElem;

    Session.SetProperty("is_AS", (ArrayOptFind(curUserDoc.category_id, "This == 'as'") != undefined));
    if (curUserDoc.position_id.HasValue) {
        positionID = curUserDoc.position_id;
        positionDoc = OpenDoc(UrlFromDocID(positionID)).TopElem;

        positionSiteID = OptInt(positionDoc.custom_elems.ObtainChildByKey("position_site").value, 0);

        Session.SetProperty("is_S", (ArrayCount(XQuery("for $elem in cc_mars_sites where $elem/id = " + positionSiteID + " and MatchSome($elem/name, ('MIR', 'NOV', 'LUZ', 'RND', 'OKF', 'STP')) return $elem")) > 0));
    }
    else {
        Session.SetProperty("is_S", (false));
    }

    str = "for $m in func_managers,";
    str += " $b in boss_types";
    str += " where $m/boss_type_id = $b/id";
    str += " and $b/code = 'main'";
    str += " and $m/catalog = 'collaborator'";
    str += " and $m/object_id = " + curUserID;
    str += " return $m";

    Session.SetProperty("has_FM", (ArrayOptFirstElem(XQuery(str)) != undefined));
}
else if (!Session.HasProperty("is_AS") && !Session.HasProperty("is_S") && !Session.HasProperty("has_FM")) {
    Session.SetProperty("is_AS", (false));
    Session.SetProperty("is_S", (false));
    Session.SetProperty("has_FM", (false));
}

// для проверки профилей роли
sql = Array(
    'SELECT',
    '	"pal"."category_id" AS "category_id"',
    'FROM',
    '	"' + tenancy_name + '"."cc_mars_profile_adjustment_logs" AS "pal"',
    'WHERE',
    '	"pal"."collaborator_id" = ' + curUserID,
    '	AND "pal"."category_id" IS NOT NULL',
    '	AND "pal"."status" IN (N\'Проверка просрочена\', N\'Выслано напоминание\', N\'Уведомлен\')'
).join("\r\n");

logs = XQuery("sql: " + sql);
log_count = ArrayCount(logs);

profile_role_validatin_link = log_count == 1 ? "profile_role_validation&catalog_id=" + ArrayOptFirstElem(logs).category_id.Value : "my_profile_role_validation";

role_is_AS = ArrayOptFind(___doc.TopElem.category_id, "This == 'as'") != undefined;
%>
    <div class="m-header__wrapper">
        <div class="m-container">
            <div class="m-header">
                <a href="/view_doc.html?mode=home" class="m-header-l"></a>
                <div class="m-header-r">
                    <div class="m-feedback" id="feedback_area"><a class="m-feedback-btn <%=Session.unfinished_responses_count == 0 ? " disabled" : ""%>" href="<%=(Session.unfinished_responses_count > 0 ? "/view_doc.html?mode=responses" : "javascript:;")%>">Обратная связь
                        <%
	if (Session.unfinished_responses_count > 0)
                        {
%>
					<div class="m-feedback-btn_count"><%=Session.unfinished_responses_count%></div>	
<%
	}
%>
                    </a><span></span>
                </div>
                <div class="m-menu-wrap">
                    <div class="m-search">
                        <a href="view_doc.html?mode=search" class="m-search-open"></a>
                    </div>
                    <div class="m-header-top">
                        <ul class="m-ruk-links">
                            <%
                            if (Session.access_to_reports)
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-report" href="/view_doc.html?mode=reports">
									<div>
										<div class="m-underline">Отчеты</div>
									</div>
								</a>
							</li>
						<%
							}

                            if (curUser.category_id.ByValueExists("pbi"))
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-report" href="/view_doc.html?mode=power_bi">
									<div>
										<div class="m-underline">Power BI</div>
									</div>
								</a>
							</li>
						<%
							}

							if (ArrayCount(assessment_control_links) > 1)
                            {
						%>
							<li class="m-ruk-links_item">
								<div class="m-link-tests m-d-block">
									<span>
										<div>
											<div class="m-underline" style="border-bottom: none;">Управление тестами<i class="m-main__icon_arrow"></i></div>
										</div>
									</span>
									<ul class="m-submenu" style="display: none;">
									<%
										for (elem in assessment_control_links)
										{
									%>
											<li><a href="<%=elem.link%>"><%=elem.name%></a></li>
									<%
										}
									%>                                    
									</ul>
								</div>
							</li>
						<%                        	
							}
                            else if (ArrayCount(assessment_control_links) == 1)
                            {
						%>
							<li class="m-ruk-links_item">
								<div class="m-link-tests m-d-block">
									<span>
										<div>
											<a href="<%=assessment_control_links[0].link%>">
												<div class="m-underline"><%=assessment_control_links[0].name%></div>
											</a>
										</div>
									</span>
								</div>
							</li>    
						<%
							}

                            if (( Session.is_LM ) || ( Session.is_AS && Session.is_S && Session.has_FM ) || is_sc_expert)
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-ruk" href="/view_doc.html?mode=boss_panel">
									<div>
										<div class="m-underline">Панель руководителя</div>
									</div>
								</a>
							</li>
						<%
							}
                            if (role_is_AS && !is_sc_expert && !is_role_admin && !is_contractor)
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-ruk" href="/view_doc.html?mode=qual_levels">
									<div>
										<div class="m-underline">Квалификационные уровни</div>
									</div>
								</a>
							</li>
						<%
							}
                            if (is_chak)
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-ruk" href="/view_doc.html?mode=test_results_chak">
									<div>
										<div class="m-underline">Панель ЧАКа</div>
									</div>
								</a>
							</li>
						<%
							}
                            if (list_profile_role) //comeback
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-settings" href="view_doc.html?mode=profile_role_settings">
									<div>
										<div class="m-underline">Настройки списка квалификаций</div>
									</div>
								</a>
							</li>
						<%
							}
							if (log_count > 0 && curUser.category_id.ByValueExists("owner_profile_role"))
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-settings" href="/view_doc.html?mode=<%=profile_role_validatin_link%>">
									<div>
										<div class="m-underline">Проверка списка квалификаций</div>
									</div>
								</a>
							</li>
						<%
							}
                            if (curUser.category_id.ByValueExists("owner_training_program") && training_program_validation_link != "")
                            {
						%>
							<li class="m-ruk-links_item">
								<a class="m-link-settings" href="<%=training_program_validation_link%>">
									<div>
										<div class="m-underline">Проверка тренинг-программ</div>
									</div>
								</a>
							</li>						
						<%	
							}
						%>
                        </ul>
                        <div class="m-user">
                            <div class="m-user-photo" style="<%=__style%>"></div>
                            <div class="m-user-name">
                                <span><%=curUser.firstname%></span>
                                <span><%=curUser.lastname%></span>
                            </div>
                            <i class="m-user-exit" id="logout"></i>
                        </div>
                    </div>
                    <div class="m-header-bottom">
                        <ul class="m-menu my-menu">
                            <li>
                                <a href="/view_doc.html?mode=courses">курсы</a>
                                <%
                                if (__courses_num !== 0)
                                {
							%>
									<i><%=__courses_num%></i>
							<%
								}
							%>
                                <div class="m-menu-submenu">
                                    <div class="m-menu-submenu__text">
                                        Пройти обучающие электронные курсы
                                    </div>
                                    <div class="m-menu-submenu__arrow"></div>
                                </div>
                            </li>
                            <li>
                                <a href="/view_doc.html?mode=active_test_learning">тесты</a>
                                <%
                                if (__tests_num !== 0)
                                {
							%>
									<i><%=__tests_num%></i>
							<%
								}
							%>
                                <div class="m-menu-submenu">
                                    <div class="m-menu-submenu__text">
                                        Пройти тестирование полученных знаний
                                    </div>
                                    <div class="m-menu-submenu__arrow"></div>
                                </div>
                            </li>
                            <%
                            if (__access_to_polls)
                            {
						%>			
							<li>
								<a href="/view_doc.html?mode=my_self_rating">самооценка</a>
							<%
								if (__polls_num !== 0)
								{
							%>
									<i><%=__polls_num%></i>
							<%
								}
							%>
								<div class="m-menu-submenu">
									<div class="m-menu-submenu__text">
										Оцените свой уровень знаний и умений
									</div>
									<div class="m-menu-submenu__arrow"></div>
								</div>
							</li>
						<%
							}
						%>
                            <li>
                                <a href="/view_doc.html?mode=calendar">очное обучение</a>
                                <div class="m-menu-submenu">
                                    <div class="m-menu-submenu__text">
                                        Найти запланированные обучающие мероприятия
                                    </div>
                                    <div class="m-menu-submenu__arrow"></div>
                                </div>
                            </li>
                            <li>
                                <a href="/view_doc.html?mode=profile_role">квалификации</a>
                                <i id="header_qual_num"></i>
                                <div class="m-menu-submenu">
                                    <div class="m-menu-submenu__text">
                                        Список требований и квалификаций по должности
                                    </div>
                                    <div class="m-menu-submenu__arrow"></div>
                                </div>
                            </li>
                            <li>
                                <a href="/view_doc.html?mode=library_section_selection">библиотека</a>
                                <div class="m-menu-submenu">
                                    <div class="m-menu-submenu__text">
                                        Перейти к обучающим материалам
                                    </div>
                                    <div class="m-menu-submenu__arrow"></div>
                                </div>
                            </li>
                        <%  
                            if (is_Access) {
                        %>
                            <li>
                                <a href="/view_doc.html?mode=my_knowledge_profile">ознакомления</a>
                                <div class="m-menu-submenu">
                                    <div class="m-menu-submenu__text">
                                        Перейти к ознакомлениям
                                    </div>
                                    <div class="m-menu-submenu__arrow"></div>
                                </div>
                            </li>
                        <%  
                            }
                        %>
                        </ul>
                        <ul class="m-menu top-menu">
                            <!-- <%
                            if (__doc_about_template != "#")
                            {
							%>
								<li><a href="/<%=__doc_about_template%>">О портале</a></li>
							<%
							}
							%> -->
                            <li><a href="/view_doc.html?mode=news">Новости</a></li>
                            <li><a href="/view_doc.html?mode=contacts_info">Контакты</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div id="js_guide_overlay" class="m-none m-guide-overlay"></div>
    </div>
</div >
<div class="m-instruction min">
</div>
<script>
	(function () {
	var header = {
		logout: function () {
			var sDate = new Date(0).toUTCString();
			document.cookie = "<%=curHost.auth_cookie_login%>=null; path=/; expires=" + sDate + ";<%=( curHost.auth_cookie_domain.HasValue ? 'domain=' + curHost.auth_cookie_domain : '' )%>";
			document.cookie = "<%=curHost.auth_cookie_pass%>=null; path=/; expires=" + sDate + ";<%=( curHost.auth_cookie_domain.HasValue ? 'domain=' + curHost.auth_cookie_domain : '' )%>";
			window.location.href = window.location.protocol + "//" + window.location.host + "/view_doc.html?mode=default&logout=1";
		},
		// get_cookie: function(name) {
            // 	var value = "; " + document.cookie;
            // 	var parts = value.split("; " + name + "=");
            // 	if (parts.length == 2) return parts.pop().split(";").shift();
            // },
            underlining: function() {
            $(".m-header-r .m-menu a").each(function () {
                if (window.location.pathname + window.location.search == $(this).attr("href")) {
                    $(this).addClass("active");
                    return false;
                }
            });
		},
        set_events: function() {
            $(".m-user").on("click", function (e) {
                document.location.href = "/view_doc.html?mode=mars_personal";
            });

        $("#logout").on("click", function(e) {
            e.stopPropagation();
        header.logout();
			});

			// if (header.get_cookie("user_login") == undefined) {
            // 	window.location.href = "/view_doc.html?mode=default";
            // }

            $(document).on('mouseenter', '.m-link-tests:has(".m-submenu")', function () {
                $(".m-link-tests .m-submenu").stop().fadeIn(300);
            });

        $(document).on('mouseleave','.m-link-tests:has(".m-submenu")', function(){
            $(".m-link-tests .m-submenu").stop().fadeOut(300);
			});
		}
	}

        header.underlining();
        header.set_events();

        $("#header_qual_num").text(localStorage.getItem("header_qual_num") != null && localStorage.getItem("header_qual_num") != 0 ? localStorage.getItem("header_qual_num") : "");

        if (<%=(Session.HasProperty("notification_needed") ? Session.notification_needed : false)%> && <%=Session.unfinished_responses_count%> > 0){
		
		if (sessionStorage.getItem("poll_notif_occurred") == null){

            $("#feedback_area").append(
                $("<div>").attr("id", "poll_notification_area").addClass(<%= Session.unfinished_responses_count %> > 5 ? "m-feedback-memo-red" : "m-feedback-memo").append(
                    $("<div>").addClass("m-feedback-memo_close").append(
                        '<svg version="1.1" id="Фигура_7_копия_3_1_" opacity="0.5" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 11 11" enable-background="new 0 0 11 11" xml:space="preserve">' +
                        '	<g id="Фигура_7_копия_3">' +
                        '		<g>' +
                        '			<polygon fill-rule="evenodd" clip-rule="evenodd" points="10.4,1.3 9.7,0.6 5.5,4.8 1.3,0.6 0.6,1.3 4.8,5.5 ' +
                        '				0.6,9.7 1.3,10.4 5.5,6.2 9.7,10.4 10.4,9.7 6.2,5.5 		"></polygon>' +
                        '		</g>' +
                        '	</g>' +
                        '</svg>'
                    ).on("click", function () {
                        $("#poll_notification_area").detach();
                    }),
                    $("<div>").addClass("m-feedback-memo_h").text("Пройденные активности ждут вашего отзыва!"),
                    $("<div>").addClass("m-feedback-memo_content").append(
                        $("<div>").addClass("m-feedback-memo_span").append(
                            $("<div>").addClass("m-feedback-memo_title").text("Анкет:"),
                            $("<div>").addClass("m-feedback-memo_count").text(
								<%= Session.unfinished_responses_count %>
							)
                    ),
                    $("<button>").addClass("m-btn-white m-feedback-memo_btn").text("Написать отзывы...").on("click", function () {
                        location.href = "/view_doc.html?mode=responses";
                    })
                )
				)
        );

        if (<%=Session.unfinished_responses_count%> > 5){

            $(".m-btn-white.m-feedback-memo_btn").css({ "color": "#b8232e", "border-color": "#b8232e", "vertical-align": "bottom" });
			}

        sessionStorage.setItem("poll_notif_occurred", true);
		}
	}
})()
    </script>