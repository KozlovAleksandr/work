_requests = ArraySelectAll(XQuery("for $req in requests where ($req/request_type_id=6898310202144269309 or $req/request_type_id=6878368805010230083) and $req/status_id='active' and ($req/workflow_state='accept' or $req/workflow_state='canceled') return $req"));

for (_req in _requests) {
    _person = _req.person_id.OptForeignElem;
    if (_person != undefined && _person.is_dismiss == true) {
        _reqDoc = OpenDoc(UrlFromDocID(_req.id));
        _reqDoc.TopElem.status_id = 'close';
        _reqDoc.Save();
    }
}