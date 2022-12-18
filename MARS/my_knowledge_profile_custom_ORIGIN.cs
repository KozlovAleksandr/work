<%
	oParamSource = ISDIALOG ? PARAMETERS : curUrlQuery;
	arrTabListParam = String( tools_web.get_web_param( curParams, "my_knowledge_profile.tab_list", "profile;update_list;acquaint", true ) ).split( ";" );
	showUnconfirmedObjects = tools_web.get_web_param( curParams, "my_knowledge_profile.show_unconfirmed_objects", '0', true );
	searchPanelExpanded = tools_web.get_web_param( curParams, "my_knowledge_profile.search_panel_expanded", 'false', true );
	search_exist = ( oParamSource.GetOptProperty("search") != undefined && tools_web.is_true( oParamSource.GetOptProperty("search") ) );
	if ( search_exist )
		searchPanelExpanded = true;
	searchParam = String( tools_web.get_web_param( curParams, 'my_knowledge_profile.search_panel_param', 'classifier;create_date;action_date;key_word;tag;expert;status', true ) ).split( ';' );
	
	sShowExpertQuestionBtn = tools_web.get_web_param( curParams, 'my_knowledge_profile.show_expert_question_button', '0', true );
	
	fieldArray = Array( "knowledge_classifier_id", "start_create_date", "finish_create_date", "start_action_date", "finish_action_date", "key_word", "tag_id", "expert_id", "status" );
	urlFieldArray = Array( "kc_id", "from_cdate", "to_cdate", "from_adate", "to_adate", "keyword", "tag_id", "expert_id", "status" )
	
	iTreeWeight = Int( tools_web.get_web_param( curParams, "my_knowledge_profile.tree_wight", 300, true ));
	knowledge_classifier_id = (oParamSource.GetOptProperty( "kc_id") != undefined ? oParamSource.GetOptProperty( "kc_id" ) : "");
	start_create_date = (oParamSource.GetOptProperty( "from_cdate") != undefined ? oParamSource.GetOptProperty( "from_cdate" ) : "");
	finish_create_date = (oParamSource.GetOptProperty( "from_cdate") != undefined ? oParamSource.GetOptProperty( "to_cdate" ) : "");
	start_action_date = (oParamSource.GetOptProperty( "from_cdate") != undefined ? oParamSource.GetOptProperty( "from_adate" ) : "");
	finish_action_date = (oParamSource.GetOptProperty( "from_cdate") != undefined ? oParamSource.GetOptProperty( "to_adate" ) : "");
	key_word = (oParamSource.GetOptProperty( "keyword") != undefined ? oParamSource.GetOptProperty( "keyword" ) : "");
	tag_id = (oParamSource.GetOptProperty( "tag_id") != undefined ? oParamSource.GetOptProperty( "tag_id" ) : "");
	expert_id = (oParamSource.GetOptProperty( "expert_id") != undefined ? oParamSource.GetOptProperty( "expert_id" ) : "");
	status = (oParamSource.GetOptProperty( "status") != undefined ? oParamSource.GetOptProperty( "status" ) : "");
	
	i = 0;
	iTab = (0 - 1);
	
	strAction= "search";
	strMode= "my_knowledge_profile";
%>

<SPXMLScreen>
	<Action Name="ConfirmAcquaintAction" Source="ConfirmAcquaintAction" Success="{!messageText};UPDATE=NeedToAcquaint;" Failure="{!messageText}">
		<Param Name="curUserID" Value="<%=curUserID%>"/>
		<Param Name="acquaintAssignID" Value=""/>
		<Param Name="action" Value="confirm"/>
		<Param Name="tmp" Value=""/>
	</Action>
	<Dialog Name="QuestionAcquaint" Source="dlg_question_acquaint" Title="<%=XmlAttrEncode(tools_web.get_web_const( "c_questions", curLngWeb ))%>" Close="UPDATE=NeedToAcquaint;">
		<Param Name="AcquaintAssignID" Value=""/>
	</Dialog>
	<Action Name="ConfirmAcquaintActionUpdate" Source="ConfirmAcquaintAction" Success="{!messageText};UPDATE=UpdateListGrid;" Failure="{!messageText}">
		<Param Name="curUserID" Value="<%=curUserID%>"/>
		<Param Name="acquaintAssignID" Value=""/>
		<Param Name="action" Value="confirm"/>
		<Param Name="tmp" Value="Update"/>
	</Action>
	<Dialog Name="QuestionAcquaintUpdate" Source="dlg_question_acquaint" Title="<%=XmlAttrEncode(tools_web.get_web_const( "c_questions", curLngWeb ))%>" Close="UPDATE=UpdateListGrid;">
		<Param Name="AcquaintAssignID" Value=""/>
	</Dialog>
	<Collection Name="KnowledgeMapTree" Source="KnowledgeMapTree">
<%
	fieldArray = Array( "knowledge_classifier_id", "start_create_date", "finish_create_date", "start_action_date", "finish_action_date", "key_word", "tag_id", "expert_id", "status" )
	for ( _field in fieldArray )
	{
%>
		<Param Name="<%=_field%>" Value="{<%=_field%>}"/>
<%	
	}
%>	
		<Param Name="context" Value="{CONTEXT}"/>
		<Param Name="curUserID" Value="<%=curUserID%>"/>
	</Collection>
	<Collection Name="ArchiveAcquaint" Source="ArchiveAcquaint">
		<Param Name="context" Value="{CONTEXT}"/>
		<Param Name="curUserID" Value="<%=curUserID%>"/>
		<Param Name="key_word" Value="{aakey_word}"/>
	</Collection>
	<Collection Name="NeedToAcquaintCollection" Source="NeedToAcquaintCollection_CUSTOM">
		<Param Name="context" Value="{CONTEXT}"/>
		<Param Name="curUserID" Value="<%=curUserID%>"/>
		<Param Name="key_word" Value="{nakey_word}"/>
	</Collection>
	<Collection Name="UpdateListGridCollection" Source="UpdateListGridCollection">
		<Param Name="knowledge_classifier_id" Value="{knowledge_classifier}"/>
		<Param Name="start_create_date" Value="{create_date}"/>
		<Param Name="finish_create_date" Value=""/>
		<Param Name="start_action_date_s" Value="{action_date_s}"/>
		<Param Name="finish_action_date_s" Value="{action_date_f}"/>
		<Param Name="start_action_date_f" Value=""/>
		<Param Name="finish_action_date_f" Value=""/>
		<Param Name="key_word" Value="{mkpkey_word}"/>
		<Param Name="tag_id" Value="{tag_id}"/>
		<Param Name="expert_id" Value="{expert_id}"/>
		<Param Name="status" Value="{status}"/>
		<Param Name="check_access" Value="<%=tools_web.get_web_param( curParams, "my_knowledge_profile.check_access", "false", true )%>"/>
		<Param Name="curUserID" Value="<%=curUserID%>"/>
		<Param Name="knowledge_profile_id" Value=""/>
		<Param Name="bShowInMobile" Value="false"/>
	</Collection>
<%
	_use_hier = tools_web.get_web_param( curParams, "my_knowledge_profile.full_list_question_by_hier", "0", true );	

	if ( oParamSource.GetOptProperty( "qsort_type" ) != undefined )
		_sort_type = oParamSource.GetOptProperty( "qsort_type" );
	else
		_sort_type = tools_web.get_web_param( curParams, "my_knowledge_profile.question_sort_type", "", true )
	if ( _sort_type == "" )
		_sort_type = "question";
		 
%>
	<Dialog Name="AnswerExspertDialog" Source="expert_answer" Title="<%=XmlAttrEncode(tools_web.get_web_const( "veqb_expert_answer", curLngWeb ))%>" Close="ACTION=ConfirmAcquaintAction">
		<Param Name="iQuestionId" Value=""/>
	</Dialog>
	
	<Collection Name="QuestionsCollection" Source="view_knowledge_map_tree_template_questions_collection">
		<Param Name="iExpertId" Value="{expert_id}"/>
		<Param Name="iObjectKC" Value="{KnowledgeClassifierID}"/>
		<Param Name="iObjectKP" Value="{KnowledgePartID}"/>
		<Param Name="sKeyWord" Value="{questionskey_word}"/>
		<Param Name="iTagId" Value="{tag_id}"/>
		<Param Name="bUseHier" Value="<%=_use_hier%>"/>
		<Param Name="sSortType" Value="<%=_sort_type%>"/>
	</Collection>

	<TabControl Name="AssessmentBodyTab" ActiveTab="<%=(oParamSource.GetOptProperty( "main_tab" ) != undefined ? oParamSource.GetOptProperty( "main_tab" ) : "0") %>" Width="100%" DisplayMode="tab" TabsLocation="<%=curDevice.disp_type == "mobile" ? "n" : "w"%>">
<%
	for (elemParam in arrTabListParam)
	{
		if (elemParam == "profile")
		{
				iTab++;
%>
				<TabItem Class="icon-profile" Title="<%=tools_web.get_web_const( "moyprofilznani", curLngWeb )%>">
<%
					treeCollectionName =  "MyKnowledgeProfileTree";
					Response.Write( (EvalCodePageUrl( (global_settings.web_path + "view_knowledge_map_tree_template.xaml") ) ));
%>
				</TabItem>
<%	
		}
		else if (elemParam == "update_list")
		{
				iTab++;
				cntUL = 0;
%>
				<TabItem Class="icon-list-alt" Title="<%=tools_web.get_web_const( "vmkpb_update_list", curLngWeb )%>">
<%	
	function add_filters_parameters()
	{
		sMainTempFilters = new Array()
		sTempFilters = sFilters;

		function add_filter( name, is_main )
		{
			try{
				is_main;
			}
			catch( ex ){ is_main = false; }
			obj_filter = new Object();
			ident = "";
			alert("name "+name)
			switch( name )
			{
				case "action_date_s":
					const = "vkmb_start_action_date";
				case "action_date_f":
					if( name == "action_date_f" )
						const = "j87phjbjvh";
				case "create_date":
					obj_filter.type = "date";
					if( name == "create_date" )
						const = "c_create_date";
					ident = "start_" + name;		
					break;
					
				case "tag":
					const = "vkmb_tag";
				case "classifier":
					if( name == "classifier" )
					{
						const = "vkpb_classifier";
						name = "knowledge_" + name;
					}
				case "expert":
					obj_filter.type = "foreign_elem";
					if( name == "expert" )
						const = "vkpb_expert";
						
					ident = name + "_id";
					obj_filter.SetProperty( "default", OptInt( CONTEXT.GetOptProperty( ident, curUrlQuery.GetOptProperty( ident, "" ) ), "" ) );
					obj_filter.SetProperty( "catalog_name", name );
					break;
					
				case "status":
					const = "c_status";
					obj_filter.type = "combo";
					ident = name;
					obj_filter.items = new Array();
					for ( _status in common.status_in_knowledge_map_types )
						obj_filter.items.push( { value: _status.id, title: _status.name } );
					break;
					
				case "object_type":
					ident = "objectType";
					const = "c_object_type";
					obj_filter.type = "combo";

					obj_filter.items = new Array();
					obj_filter.items.push( { value: "all", title: tools_web.get_web_const( "xco2menws4", curLngWeb ) } );
					for ( _obj_type in ArraySelectDistinct( knowledge_objects, "This.catalog" ) )
						obj_filter.items.push( { value: _obj_type.catalog, title: _obj_type.catalog.ForeignElem.title } );
					
					break;

			}
			obj_filter.name = ident;
			if( !is_main )
				obj_filter.title = tools_web.get_web_const( const, curLngWeb );
			return obj_filter;	
		}	

		cnt_filter = 0;
		for( filter in sTempFilters )
		{
			if( cnt_filter >= 3 )
			{
				cnt_filter = 0;
				row_filters.push( arr_filters );
				arr_filters = new Array();
			}
			if( filter == "action_date" )
			{
				arr_filters.push( add_filter( "action_date_s" ) );
				cnt_filter++;
				if( cnt_filter >= 3 )
				{
					cnt_filter = 0;
					row_filters.push( arr_filters );
					arr_filters = new Array();
				}
				arr_filters.push( add_filter( "action_date_f" ) );
			}
			else
				arr_filters.push( add_filter( filter ) );
				
			cnt_filter++;
		}
		if( cnt_filter > 0 )
			row_filters.push( arr_filters );
		
		arr_filters = new Array();
		for( filter in sMainTempFilters )
		{
			if( filter == "action_date" )
			{
				arr_filters.push( add_filter( "action_date_s", true ) );
				arr_filters.push( add_filter( "action_date_f", true ) );
			}
			else
				arr_filters.push( add_filter( filter, true ) );
		}
	}
	sMainFilters = new Array();
	sFilters = new Array();
	for( filter in searchParam )
		if( "action_date" )  
		if( filter != "key_word" )
			sFilters.push( filter );
	arr_filters = new Array();
	row_filters = new Array();
	add_filters_parameters();
	curFilter = {
		'id': "mkp",
		'search_field': "mkpkey_word",
		'selectors': '',
		'search_width': 150,
		'disp_search': ArrayOptFind( searchParam, "This == 'key_word'" ) != undefined,
		'selectors_field': "TypeVisiblemkp",
		'search_action': "UPDATE=UpdateListGrid;",
		'selectors_action': "UPDATE=UpdateListGrid;",
		'action': "UPDATE=UpdateListGrid;",
		'row_filters': row_filters,
		'filters': arr_filters,
	};
	Response.Write( EvalCodePageUrl( global_settings.web_path + "view_filter.xaml" ) );
%>
					<DataGrid Name="UpdateListGrid" Source="{UpdateListGridCollection}" Selection="single" Height="" PageSize="10">
						<DataGridColumn Title="<%=tools_web.get_web_const( "c_name", curLngWeb )%>" Value="name" Type="link" Width="<%=curDevice.disp_type == "mobile" ? "150" : "100%"%>" Click="{!on_click}OPENURL={url}" Sortable="true"/>
						<DataGridColumn Title="<%=tools_web.get_web_const( "c_type", curLngWeb )%>" Value="object_type_name" Width="200" Type="link" Click="{!on_click}OPENURL={url}" Sortable="true"/>
						<!--<DataGridColumn Title="<%=tools_web.get_web_const( "vrb_date_last_edit", curLngWeb )%>" Value="date" Width="200" Type="string" Sortable="true"/>-->
						<DataGridColumn Title="<%=tools_web.get_web_const( "vfb_action", curLngWeb )%>" Value="action" Width="200" Type="link" Sortable="false" Click="CONFIRM=<%=tools_web.get_web_const( "vcb_mess_confirm", curLngWeb )%>;SET=ConfirmAcquaintAction/main_tab,<%=iTab%>;SET=ConfirmAcquaintAction/acquaintID,{xacquaint_id};ACTION=ConfirmAcquaintAction"/>
					</DataGrid>
				</TabItem>
<%	
				
		}
		else if (elemParam == "acquaint")
		{
				iTab++;
				acquaintTabListParam = String( tools_web.get_web_param( curParams, 'my_knowledge_profile.acquaint_tab_list', 'need_to_acquaint;archive', true ) ).split( ';' );
		%>
				<TabItem Class="icon-edit" Title="<%=tools_web.get_web_const( "vmkpb_acquaint", curLngWeb )%>">		
					<TabControl Name="AcquaintBodyTab" DisplayMode="tab" MinHeight="300" ActiveTab="<%=(oParamSource.GetOptProperty( "atab" ) != undefined ? oParamSource.GetOptProperty( "atab" ) : "0") %>" Class="XAML-tabcontrol-filter" Width="100%">
		<%
				if ( ArrayOptFind( acquaintTabListParam, "This == 'need_to_acquaint'" ) != undefined )
				{
		%>
						<TabItem Class="icon-zoom" Title="<%=tools_web.get_web_const( "vmkpb_need_to_acquaint", curLngWeb )%>">
<%
						curFilter = {
							'id': "na",
							'search_field': "nakey_word",
							'selectors': '',
							'search_width': 150,
							'disp_search': true,
							'selectors_field': "TypeVisiblemkp",
							'search_action': "UPDATE=NeedToAcquaint;",
							'selectors_action': "UPDATE=NeedToAcquaint;",
							'action': "UPDATE=NeedToAcquaint;",
						};
						Response.Write( EvalCodePageUrl( global_settings.web_path + "view_filter.xaml" ) );
%>
							<DataGrid Name="NeedToAcquaint" Source="{NeedToAcquaintCollection}" Selection="single" Height="<%=curDevice.disp_type == "mobile" ? "200" : "400"%>" PageSize="15">
							 	<DataGridColumn Title="<%=tools_web.get_web_const( "c_name", curLngWeb )%>" Value="name" Type="link" Width="<%=curDevice.disp_type == "mobile" ? "150" : "100%"%>" MinWidth="<%=curDevice.disp_type == "mobile" ? "150" : "250"%>" Click="{!on_click}OPENWINDOW={url}" Sortable="true"/>
							 	<DataGridColumn Title="<%=tools_web.get_web_const( "c_type", curLngWeb )%>" Value="object_type_name" Width="<%=curDevice.disp_type == "mobile" ? "100" : "200"%>" Type="link" Click="{!on_click}OPENURL={url}" Sortable="true"/>						
                                <!--<DataGridColumn Title="<%=tools_web.get_web_const( "dataizmeneniya", curLngWeb )%>" Value="date" Width="<%=curDevice.disp_type == "mobile" ? "150" : "200"%>" Type="string" Sortable="true"/>
								<DataGridColumn Title="<%=tools_web.get_web_const( "vsb_term_of_performance", curLngWeb )%>" Value="period" Width="<%=curDevice.disp_type == "mobile" ? "150" : "200"%>" Type="string" Sortable="true"/>-->
								<DataGridColumn Title="<%=tools_web.get_web_const( "vfb_action", curLngWeb )%>" Value="action" Width="<%=curDevice.disp_type == "mobile" ? "150" : "200"%>" Type="link" Sortable="false" Click="SET=ConfirmAcquaintAction/acquaintAssignID,{id};ACTION=ConfirmAcquaintAction"/>
							</DataGrid>
						</TabItem>
		<%		
				}
				if ( ArrayOptFind( acquaintTabListParam, "This == 'archive'" ) != undefined )
				{
		%>
						<TabItem Class="icon-file-archive-o" Title="<%=tools_web.get_web_const( "vmkpb_archive", curLngWeb )%>">
<%
						curFilter = {
							'id': "aa",
							'search_field': "aakey_word",
							'selectors': '',
							'search_width': 150,
							'disp_search': true,
							'selectors_field': "TypeVisiblemkp",
							'search_action': "UPDATE=ArchiveAcquaintGrid;",
							'selectors_action': "UPDATE=ArchiveAcquaintGrid;",
							'action': "UPDATE=ArchiveAcquaintGrid;",
						};
						Response.Write( EvalCodePageUrl( global_settings.web_path + "view_filter.xaml" ) );
%>
							<DataGrid Name="ArchiveAcquaintGrid" Source="{ArchiveAcquaint}" Selection="single" Height="300" PageSize="15">
							 	<DataGridColumn Title="<%=tools_web.get_web_const( "c_name", curLngWeb )%>" Value="name" Type="link" Width="<%=curDevice.disp_type == "mobile" ? "150" : "100%"%>" MinWidth="<%=curDevice.disp_type == "mobile" ? "150" : "250"%>" Click="{!on_click}OPENURL={url}" Sortable="true"/>
							 	<DataGridColumn Title="<%=tools_web.get_web_const( "c_type", curLngWeb )%>" Value="object_type_name" Width="<%=curDevice.disp_type == "mobile" ? "100" : "200"%>" Type="link" Click="{!on_click}OPENURL={url}" Sortable="true"/>
								<DataGridColumn Title="<%=tools_web.get_web_const( "vmkpb_acquaint_date", curLngWeb )%>" Value="date" Width="<%=curDevice.disp_type == "mobile" ? "150" : "200"%>" Type="string" Sortable="true"/>
							</DataGrid>
						</TabItem>
		<%		
				}
		%>			
					</TabControl>
				</TabItem>
<%	
				
		}
	}
%>
						
	</TabControl>
</SPXMLScreen>