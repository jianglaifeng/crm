$(function () {

    let userId = null
    // console.dir(window.location.href);
    let params = window.location.href.queryURLParams()
    // console.log(params);
    //如果你点击编辑进到此页面，在params中是有ID
    //如果你是直接点击了添加员工，进来的 parasm中是没有ID的
    if (params.hasOwnProperty("id")) {
        userId = params.id
        //根据ID获取用户的信息，实现数据的回显
        getBaseInfo()
    }
    //async 修饰的函数，最终返回的是promise
    async function getBaseInfo() {
        let result = await axios.get("/user/info", {
            params: { userId }
        })
        if (result.code === 0) {
            //给表单中塞数据，实现数据的回显
            result = result.data
            $(".username").val(result.name)
            result.sex == 0 ? $("#man").prop("checked", true) : $("#woman").prop("checked", true)
            $(".useremail").val(result.email)
            $(".userphone").val(result.phone)
            $(".userdepartment").val(result.departmentId)
            $(".userjob").val(result.jobId)
            $(".userdesc").val(result.desc)
            return
        }
        alert('编辑不成功，可能是网络不给力。。。');
        userId = null
    }

    //初始化部门和职务的数据
    initDeptAndJob()
    async function initDeptAndJob() {
        let departmentData = await queryDepart()
        let jobData = await queryJob()
        // console.log(departmentData);
        // console.log(jobData);

        if (departmentData.code === 0) {
            departmentData = departmentData.data
            let str = ``
            departmentData.forEach(item => {
                str += `<option value="${item.id}">${item.name}</option>`
            })
            $(".userdepartment").html(str)
        }
        if (jobData.code === 0) {
            jobData = jobData.data
            let str = ``
            jobData.forEach(item => {
                str += `<option value="${item.id}">${item.name}</option>`
            })
            $(".userjob").html(str)
        }
    }

    //校验函数
    function checkname() {
        let val = $(".username").val().trim()
        if (val.length === 0) {
            $(".spanusername").html("此处为必填项~")
            return false
        }
        //用户名必须填写真实姓名（2-10字）
        if (!/^[\u2E80-\u9FFF]{2,10}$/.test(val)) {
            $(".spanusername").html("名字必须是2-10个憨子~")
            return false
        }
        $(".spanusername").html("姓名OK")
        return true
    }
    function checkemail() {
        let val = $(".useremail").val().trim()
        if (val.length === 0) {
            $(".spanuseremail").html("此处为必填项~")
            return false
        }
        if (!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(val)) {
            $(".spanuseremail").html("请输入正确的邮箱~")
            return false
        }
        $(".spanuseremail").html("OK")
        return true
    }
    function checkphone() {
        let val = $(".userphone").val().trim()
        if (val.length === 0) {
            $(".spanuserphone").html("此处为必填项~")
            return false
        }
        if (!/^1[3456789]\d{9}$/.test(val)) {
            $(".spanuserphone").html("请输入正确的手机号~")
            return false
        }
        $(".spanuserphone").html("OK")
        return true
    }
    //失去焦点时，对数据进行校验
    $(".username").blur(checkname)
    $(".useremail").blur(checkemail)
    $(".userphone").blur(checkphone)

    $(".submit").click(async function () {
        if (!checkname() || !checkemail() || !checkphone()) {
            alert('你填写的数据不合法');
            return
        }

        //校验通过
        //获取用户输入的数据
        let params = {
            name: $(".username").val().trim(),
            sex: $("#man").prop("checked") ? 0 : 1,
            email: $(".useremail").val().trim(),
            phone: $(".userphone").val().trim(),
            departmentId: $(".userdepartment").val(),
            jobId: $(".userjob").val(),
            desc: $(".userdesc").val().trim()
        }
        // console.log(params);

        //判断是编辑还是新增
        if(userId){
            params.userId = userId
            //编辑
            let result = await axios.post("/user/update",params)
            if(result.code ===0){
                alert("修改数据成功")
                window.location.href = "userlist.html"
                return
            }
            alert('网络不给力，稍后再试~~~');
            return
        }
        //实现新增
        let result = await axios.post("/user/add", params)
        if (result.code === 0) {
            alert('添加员工成功~');
            window.location.href = "userlist.html"
            return
        }
        alert('网络不给力，请稍后重试~');
    })










})