$(function () {

    //获取元素
    let $navBoxList = $(".navBox>a")
    let $itemBoxList = null
    init()

    let $plan = $.Callbacks() //用来实现发布订阅

    $plan.add((_, baseInfo) => {
        //渲染用户信息和实现退出登录
        // console.log("渲染用户信息和实现退出登录",baseInfo);
        $(".baseBox>span").html(`你好，${baseInfo.name || ""}`)

        //实现退出登录
        $(".baseBox>a").click(async function () {
            let result = await axios.get("/user/signout")
            if (result.code == 0) {
                //退出登录成功
                window.location.href = "login.html"
                return
            }
            //退出登录失败
            alert("网络不给力，稍后重试")
        })
    })
    $plan.add((power) => {
        //渲染菜单  userhandle|departhandle|jobhandle|customerall
        // console.log("渲染菜单", power);
        let str =``
        if(power.includes("userhandle")){
            str +=`
            <div class="itemBox" text="员工管理">
				<h3>
					<i class="iconfont icon-yonghuming"></i>
					员工管理
				</h3>
				<nav class="item">
					<a href="page/userlist.html" target="iframeBox">员工列表</a>
					<a href="page/useradd.html" target="iframeBox">新增员工</a>
				</nav>
			</div>
            `
        }
        if(power.includes("departhandle")){
            str +=`
            <div class="itemBox" text="部门管理">
				<h3>
					<i class="iconfont icon-yonghuming"></i>
					部门管理
				</h3>
				<nav class="item">
					<a href="page/departmentlist.html" target="iframeBox">部门列表</a>
					<a href="page/departmentadd.html" target="iframeBox">新增部门</a>
				</nav>
			</div>
            `
        }
        if(power.includes("jobhandle")){
            str +=`
            <div class="itemBox" text="职务管理">
				<h3>
					<i class="iconfont icon-zhiwuguanli"></i>
					职务管理
				</h3>
				<nav class="item">
					<a href="page/joblist.html" target="iframeBox">职务列表</a>
					<a href="page/jobadd.html" target="iframeBox">新增职务</a>
				</nav>
			</div>
            `
        }
        if(power.includes("customerall")){
            str +=`
            <div class="itemBox" text="客户管理">
				<h3>
					<i class="iconfont icon-kehuguanli"></i>
					客户管理
				</h3>
				<nav class="item">
					<a href="./page/customerlist.html?lx=my" target="iframeBox">我的客户</a>
					<a href="./page/customerlist.html?lx=all" target="iframeBox">全部客户</a>
					<a href="./page/useradd.html" target="iframeBox">新增客户</a>
				</nav>
			</div>
            `
        }
        $(".menuBox").html(str)

        $itemBoxList = $(".menuBox").find(".itemBox")
    })

    //控制组织结构和客户管理点击切换
    function handGroup(index){
        //分两组  $group1 $group2
        // console.log($itemBoxList);
        let $group1 = $itemBoxList.filter((_,item)=>{
            // $(item)  item是DOM对象 $(item) 转成JQ对象
            let text = $(item).attr("text")
            return text === "客户管理"
        })
        let $group2 = $itemBoxList.filter((_,item)=>{
            let text = $(item).attr("text")
            // console.log(text);
            return /^(员工管理|部门管理|职务管理)/.test(text)
        })
        //控制哪一组显示
        if(index ===0){
            $group1.css("display","block")
            $group2.css("display","none")
        }else if(index ===1){
            $group1.css("display","none")
            $group2.css("display","block")
        }

    }
    //实现tab选项卡功能
    $plan.add(power=>{
        //控制默认显示哪一个
        let initIndex = power.includes("customer") ? 0 : 1
        $navBoxList.eq(initIndex).addClass("active").siblings().removeClass("active")
        handGroup(initIndex)
        //点击切换
        $navBoxList.click(function(){
            let index = $(this).index()
            let text = $(this).html().trim()

            // userhandle|departhandle|jobhandle|customerall
            //(text === "客户管理")&&!/customerall/.test(power)  代表你点击客户管理，但你没有这个权限
            //(text === "组织结构")&&!/(userhandle|departhandle|jobhandle)/.test(power)  代表你点击组织结构，但你没有这个权限
            if((text === "客户管理")&&!/customerall/.test(power)||(text === "组织结构")&&!/(userhandle|departhandle|jobhandle)/.test(power)){
                alert('没有权限访问！！！');
                return
            }
            $(this).addClass("active").siblings().removeClass("active")
            handGroup(index)
            initIndex = index
        })
    })
    //控制默认的iframe的src
    $plan.add(power=>{
        let url = "../page/customerlist.html"
        if(power.includes("customerall")){
            $(".iframeBox").attr("src",url)
        }
    })

    async function init() {
        //判断当前用户有没有登录
        let result = await axios.get("/user/login")
        // console.log(result);
        if (result.code != 0) {
            alert("你还没有登录，请先登录")
            window.location.href = "login.html"
            return
        }
        //代表你登录成功了
        let [power, baseInfo] = await axios.all([
            axios.get("/user/power"),
            axios.get("/user/info")
        ])
        // console.log(power);
        // console.log(baseInfo);
        power.code === 0 ? power = power.power : null
        baseInfo.code === 0 ? baseInfo = baseInfo.data : null
        $plan.fire(power, baseInfo)
    }
})