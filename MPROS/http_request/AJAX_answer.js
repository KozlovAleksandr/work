<%
    data = Request.Query.GetOptProperty('action');

    alert(data)

    switch (data) {
        case '1':
            Response.Write(EncodeJson({
                isAdress: 'true',
                url: 'https://www.google.com/',
            }));
            break;
        case '2':
            Response.Write(EncodeJson({
                isAdress: 'true',
                url: 'http://localhost/_wt/7028192885261758136',
            }));
        break;
        default:
            Response.Write(EncodeJson({
                isAdress: 'false',
                url: '',
            }));
    }
%>
