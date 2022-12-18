try
{

	acquaint_assigns_array = XQuery("for $elem in acquaint_assigns where $elem/person_id = " + curUserID + " and $elem/state_id != 'familiar' " + ( key_word != "" ? " and contains( $elem/object_name, " + XQueryLiteral( key_word ) + " )" : "" ) + " return $elem");
	result_object_array = Array();
	for ( _acquaint_assign in acquaint_assigns_array )
	{
		
		_acquaint = _acquaint_assign.acquaint_id.OptForeignElem;
		if( _acquaint == undefined )
			continue;
			
		obj = undefined;
			
		_obj = new Object();
		_obj.id = _acquaint_assign.id.Value;
		_obj.acquaint_id = _acquaint_assign.acquaint_id.Value;
		
		_obj.name = '';
		if( _acquaint.object_name.HasValue )
			_obj.name = _acquaint.object_name.Value;
		else if( _acquaint.object_id.HasValue && _acquaint.object_type.HasValue )
		{
			obj = _acquaint.object_id.OptForeignElem;
			if( obj != undefined )
				_obj.name = obj.EvalPath( common.exchange_object_types.GetChildByKey( _acquaint.object_type ).disp_name ).Value;
		}
		else
			_obj.name = _acquaint.name.Value;
			
		_obj.date = StrDate( _acquaint.modification_date.Value );
		_obj.object_type_name = _acquaint.object_type.ForeignElem.title.Value;
		_obj.url = "";
		
		catalog = common.exchange_object_types.GetOptChildByKey( _acquaint.object_type );
							
		link = "";
		if( catalog != undefined )
		{
			
			if( _acquaint.object_type == "document" )
			{
				ob = _acquaint.object_id.ForeignElem;
				if( ob.is_link )
					link = ob.link_href.Value;
				else
					link = String( tools_web.doc_link( ob ) );
				if( link == "" )
					link = tools_web.get_mode_clean_url( "doc", null, { doc_id: _acquaint.object_id } );
			}
			else
				link = catalog.web_template != "" ? tools_web.get_mode_clean_url( null, _acquaint.object_id.Value ) : "";
		}		
		_obj.url = link;
		_obj.on_click = ( _obj.url == "" ?  "ALERT=" + 'Для данного типа объекта нет шаблона на портале.' + ";STOP;" : "" );
		_obj.action =  tools_web.get_web_const( 'vherb_submit', curLngWeb )
		
		period = "";
		period_day = "";
		if ( _acquaint.normative_date.HasValue )
		{
			if ( Date() < _acquaint.normative_date  )
			{
				period_day = Int( DateDiff( _acquaint.normative_date, Date() )/86400 );
				period = period_day + "  " + tools_web.get_web_const( 'vtlpb_message2', curLngWeb )
			}
			else
				period = tools_web.get_web_const( 'vmkpb_expired', curLngWeb )
		}
		_obj.period = period;
		_obj.period_day = (period_day);
		result_object_array[ArrayCount(result_object_array)] = _obj;
	}
	if ( SORT.FIELD != null )
		result_object_array = ArraySort( result_object_array, ( SORT.FIELD == "period" ? "period_day" : SORT.FIELD ) , ( SORT.DIRECTION == "ASC" ? "+" : "-" ) );
	else
		result_object_array = ArraySort( result_object_array, "period_day", "-" );	

	RESULT = result_object_array;
}
catch(err)
{	alert(err)	}