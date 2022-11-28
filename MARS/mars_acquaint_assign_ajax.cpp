<%
//alert('mars_test_report_ajax');
var _coll = tools.read_object(Request.Query.GetOptProperty('coll'));
var action = Request.Query.GetOptProperty('action');

var _site_id = OptInt(Base64Decode(Request.Query.GetOptProperty('site_id')));
var _area_id = OptInt(Base64Decode(Request.Query.GetOptProperty('area_id')));
var _assignment_id = OptInt(Base64Decode(Request.Query.GetOptProperty('assignment_id')));

response = [];

//alert(_site_id+' '+_area_id+' '+_assignment_id);

alert(_site_id)

function _get_assign(item) {
    answer = '';
    switch (item) {
        case "assign": answer = 'назначен'; break;
        case "active": answer = 'в процессе'; break;
        case "familiar": answer = 'ознакомлен'; break;
    }
    return answer;
}

if (action == 'change_list') {
    message = false;
    //alert(action); 
    _new_object_data = OpenNewDoc('x-local://wtv/wtv_acquaint.xmd');
    _new_object_data.BindToDb();
    _new_object_data_te = _new_object_data.TopElem;
    _new_object_data_te.name = 'Ознакмоление с Ознакомление,' + Date();
    _new_object_data_te.object_type = 'document';
    _new_object_data_te.object_id = _assignment_id;
    _new_object_data_te.object_name = tools.get_object_name_field_value(_assignment_id);
    _new_object_data_te.reacquaintance_period = 0;

    //alert(EncodeJson(_coll));
    if (ArrayCount(_coll) > 0) {

        _colls = ArraySelectDistinct(_coll, "This");

        for (item in _colls) {
            _collaborator = ArrayOptFirstElem(XQuery("for $elem in positions where contains($elem/basic_collaborator_fullname, '" + item + "') return $elem"));

            if (_collaborator != undefined) {
                _child_collaborators = _new_object_data_te.collaborators.AddChild('collaborator');
                _child_collaborators.collaborator_id = _collaborator.basic_collaborator_id;
                _child_collaborators.collaborator_fullname = _collaborator.basic_collaborator_fullname;
                _child_collaborators.acquaint = 0;
                _child_collaborators.bcreateaa = 0;
                _child_collaborators.bonlydelaa = 0;

                _new_object_data.TopElem.status = 1;
                _child_types = _new_object_data_te.select_types.AddChild('select_type');
                _child_types.select_type_id = 'spisok'
                _new_object_data.Save();

                _new_object_assign = OpenNewDoc('x-local://wtv/wtv_acquaint_assign.xmd');
                _new_object_assign.BindToDb();
                _new_object_assign_te = _new_object_assign.TopElem;
                _new_object_assign_te.object_type = 'document';
                _new_object_assign_te.object_id = _assignment_id;
                _new_object_assign_te.object_name = tools.get_object_name_field_value(_assignment_id);
                _new_object_assign_te.reacquaintance_period = 0;

                _new_object_assign_te.person_id = _collaborator.basic_collaborator_id;
                _new_object_assign_te.acquaint_id = ArrayFirstElem(XQuery("for $elem in acquaints where contains($elem/name, '" + _new_object_data_te.name + "') return $elem")).id;
                _new_object_assign_te.state_id = 'assign';
                _new_object_assign_te.attempt_num = 0;
                _new_object_assign.Save();
            }
        }
        message = true;
    }
    Response.Write(message);
}
else if (action == 'show_list') {
    // alert(action);
    if (_assignment_id == undefined) {
        message = 'answer';
        Response.Write(EncodeJson(message));
    } else {
        if (_area_id == undefined && _site_id == undefined) {
            arrCollaborators = ArraySelectAll(XQuery("for $elem in positions return $elem"));
        } else if (_area_id == undefined) {
            arrCollaborators = ArraySelectAll(XQuery("for $elem in positions where $elem/basic_collaborator_id!=null() and doc-contains($elem/id,'wt_data', '[position_site=" + OptInt(_site_id) + "~string]') order by $elem/basic_collaborator_fullname return $elem"));
        } else if (_site_id == undefined) {
            arrCollaborators = ArraySelectAll(XQuery("for $elem in positions where $elem/basic_collaborator_id!=null() and doc-contains($elem/id,'wt_data', '[correct_position_area=" + OptInt(_area_id) + "~string]') order by $elem/basic_collaborator_fullname return $elem"));
        } else {
            arrCollaborators = ArraySelectAll(XQuery("for $elem in positions where $elem/basic_collaborator_id!=null() and doc-contains($elem/id,'wt_data', '[correct_position_area=" + OptInt(_area_id) + "~string]') and doc-contains($elem/id,'wt_data', '[position_site=" + OptInt(_site_id) + "~string]') order by $elem/basic_collaborator_fullname return $elem"));
        }
        if (ArrayCount(arrCollaborators) > 0) {
            for (col in arrCollaborators) {
                obj = {};
                obj.fullname = col.basic_collaborator_fullname;
                obj.post = col.name;
                docSite = tools.open_doc(col.id);
                teSite = docSite.TopElem;

                _site_name = teSite.custom_elems.ObtainChildByKey("position_site").value;
                obj.site = _site_name !== undefined ? ArrayOptFirstElem(XQuery("for $elem in cc_mars_sites where $elem/id=" + OptInt(_site_name) + " return $elem")).name : "пусто";

                _area_name = teSite.custom_elems.ObtainChildByKey("correct_position_area").value;
                _area_elements = _area_name !== undefined ? ArraySelectAll(XQuery("for $elem in cc_mars_areas where $elem/id=" + OptInt(_area_name) + " return $elem")) : [];
                obj.area = (ArrayCount(_area_elements) > 0) ? ArrayOptFirstElem(_area_elements).name : "пусто"
//                obj.area = _area_name !== undefined ? ArrayOptFirstElem(XQuery("for $elem in cc_mars_areas where $elem/id=" + OptInt(_area_name) + " return $elem")).name : "пусто";

                obj.assignment = tools.get_object_name_field_value(_assignment_id);
                assign = ArraySelectAll(XQuery("for $elem in acquaint_assigns where $elem/person_id=" + col.basic_collaborator_id + " return $elem"));
                obj.assign = (ArrayCount(assign) > 0) ? _get_assign(ArrayFirstElem(assign).state_id) : 'не назначен';
                response.push(obj);
            }
            //   alert(EncodeJson(response));
        }
        Response.Write(EncodeJson(response));
    }
}

%>