
<script>
    function getData() {
        $.ajax({
            url: 'custom_web_template.html?object_id=7172065425725094404',
            type: 'GET',
            data: {
                action: '3',
            },
            success: function(resp) {
                _obj = JSON.parse(resp)
                if (_obj.isAdress == true) {
                    window.location = _obj.url;
                } else {
                    $(document).ready(function() {
                        openModal();
                        });
                }                
            },
        })  
    }

    function openModal() {
        modal = document.getElementById('modalWindow');
        modal.style.display = 'block';
    }

    function closeModal() {
        modal = document.getElementById('modalWindow');
        modal.style.display = "none";
    }

</script>

<div id="modalWindow" class="modal">
  <div class="modal-content">
    <span class="close" onclick='closeModal()'>&times;</span>
    <h3>Заголовок сообщения</h3>
    <p>Текст сообщения</p>
  </div>
</div>

<button onclick='getData()'>ЗАПРОС</button>


<style>
    .reset {
        box-sizing:border-box;
        padding: 0;
        margin: 0
    }

    .modal {
        display: none;
        position: absolute;
        z-index: 1;
        left: calc(50% - 150px);
        top: 40px;
        width: 300px;
        height: 120px;
    }


    .modal-content {
        position: relative;
        background-color: #fefefe;
        padding: 20px;
        border: 1px solid rgb(150, 148, 148);
        width: 100%;
        height: 100%
    }

    .close {
        position: absolute;
        top: 10px;
        right: 20px;
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }

    .close:hover,
    .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }
</style>