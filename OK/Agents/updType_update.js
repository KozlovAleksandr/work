_collsArr = XQuery("for $elem in collaborators where doc-contains($elem/id,'wt_data','[UpdType=3~integer]') and $elem/login != '' and contains($elem/login,'d') = false() return $elem");

for (_coll in _collsArr) {

    sql = "";
    sql += "SELECT * " + "\r\n";
    sql += " FROM [GLOBAL].[dbo].[BOSS_EMPLOYEE]" + "\r\n";
    sql += " WHERE ([DDISMISSED] <= GETDATE() AND [DDISMISSED] IS  NOT NULL)" + "\r\n";
    sql += " AND ( ([IDCARDTYPE] = 1) OR ([IDCARDTYPE] = 3)  ) " + "\r\n";
    sql += " AND  [UpdType] != '3'" + "\r\n";
    sql += " AND  [IDKADR] = '" + _coll.code + "' \r\n";

    _person = ArrayOptFirstElem(XQuery("sql: " + sql));
    if (_person != undefined) {
        _personDoc = OpenDoc(UrlFromDocID(_person.id));
        _te_person = _personDoc.TopElem;
        _te_person.login = 'dismiss';
        _te_person.code = 'dismiss';
        _personDoc.Save();
    }
}
