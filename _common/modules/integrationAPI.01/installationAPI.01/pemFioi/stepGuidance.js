/*
 * @Author: stacker
 * @Date: 2021-07-06 23:20:58
 * @LastEditTime: 2021-07-07 00:57:07
 * @LastEditors: Please set LastEditors
 * @Description: 步骤引导文件
 * @FilePath: \bebras-tasks\_common\modules\integrationAPI.01\installationAPI.01\pemFioi\stepGuidance.js
 */

class StepGuidance{
    /**
     * elementStepList 步骤元素列表
     * 元素参数：
     * {
     *      target:                 目标元素:String
     *      tip:                    提示信息:String
     *      tips_position:{         提示信息框位置控制:String
     *          bottom:             提示信息框距离选中框下部位置:String
     *          left:               提示信息框距离选中框左侧位置:String
     *          t_left:             提示信息框三角形位置:String
     *      }          
     *      padding:                选中框padding大小:String
     *      level:                  元素所属于难度:Array
     *      step:{                  元素所属步骤
     *          easy:               元素在easy难度下数以第几部:Number
     *          medium:             元素在medium难度下数以第几部:Number
     *          hard:               元素在hard难度下数以第几部:Number
     *      }
     *      borderRadius:           选中框圆角大小:Number
     *      isSVG:                  元素是否属于SVG元素:Boolean
     * }
     */
    elementStepList = []
    level = "easy"
    guidanceName = ""
    stepIndex = 0
    constructor(stepList,guidanceName){
        let levelHash = window.location.hash?window.location.hash.replace('#',''):'easy'
        this.level = ['easy','medium','hard'].includes(levelHash)?levelHash:'easy'
        this.elementStepList = stepList.filter(item=>item.level.includes(this.level))
        this.guidanceName = guidanceName
    }
    init(){
        if(this.getCookie()){
            console.log('页面已经加载过指导，不再加载')
        }else{
            window.onload = ()=>{  
                this.guidanceBegin()
                this.updateGuidanceStep()
                $('#btn-box').on('click','#next-step-btn',()=>{
                    this.stepIndex += 1
                    this.updateGuidanceStep()
                })
                $('#btn-box').on('click','#last-step-btn',()=>{
                    this.stepIndex -= 1
                    this.updateGuidanceStep()
                })
                $('#btn-box').on('click','#complete-btn',()=>{
                    $('#guide-box').remove()
                    this.setCookie()
                })
                $(window).resize(()=>{
                    this.updateGuidanceStep()
                })
                $(document).scroll(()=>{
                    this.updateGuidanceStep()
                })
            }
        }
    }
    guidanceBegin(){
        //载入引导主体
        if($("#guide-box").length==0){
            $('body').append(`<div id="guide-box">
                              <div class="guide-area">
                                 <div class="guide-tip-box" id="guide-tip">
                                    <div class="guide-tip-content">
                                       <div class="triangle"></div>
                                       <div class="circle"></div>
                                       <div class="tip-info">
                                          <span></span>
                                       </div>
                                       <div class="button-box" id="btn-box"></div>
                                    </div>
                                 </div>
                              </div>
                           </div>`)
        }
    }
    updateGuidanceStep(){
        let elementTarget = this.elementStepList[this.elementStepList.findIndex(item=>item.step[this.level]==this.stepIndex)]
        $('#guide-box > .guide-area > .guide-tip-box > .guide-tip-content > .triangle').css('left',elementTarget.tip_position.t_left)
        $('#guide-box > .guide-area').css('width',this.getTargetWidth(elementTarget)+'px')
                                     .css('height',this.getTargetHeight(elementTarget)+'px')
                                     .css('top',this.getTargetTop(elementTarget)+'px')
                                     .css('left',this.getTargetLeft(elementTarget)+'px')
                                     .css('border-radius',elementTarget.borderRadius+'px')
                                     .css('padding',elementTarget.padding)
        for(let key in elementTarget.tip_position){
            $('#guide-tip').css(key,elementTarget.tip_position[key])
        }
        $('#guide-box > .guide-area > .guide-tip-box > .guide-tip-content > .tip-info > span').text(elementTarget.tips)
        $('#guide-box > .guide-area > .guide-tip-box > .guide-tip-content > .button-box').html(`
                                                                                                ${this.stepIndex!=0?'<div id="last-step-btn" class="step-btn"><span>上一步</span></div>':''}
                                                                                                ${this.stepIndex!=this.elementStepList.length-1?'<div id="next-step-btn" class="step-btn"><span>下一步</span></div>':''}
                                                                                                ${this.elementStepList.length-1==this.stepIndex?'<div id="complete-btn" class="step-btn" style="background-color:#FDF151;border:none;"><span>我知道了！</span></div>':''}
                                                                                             `)
    }
    getCookie(cookieName=this.guidanceName){
        var name = cookieName + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name)==0) { return c.substring(name.length,c.length); }
        }
        return false;
    }
    setCookie(cookieName=this.guidanceName,value='true'){
        var expdate = new Date();   //初始化时间
        expdate.setTime(expdate.getTime() + 5 * 60 * 1000);   //时间单位毫秒
        document.cookie = cookieName+"="+value+";expires="+expdate.toGMTString()+";path=/";
    }
    getTargetWidth(elementTarget){
        if(typeof elementTarget.target == 'object'){
           let value = 0;
           let leftValue = [2000,0]
           for(let elementItem of elementTarget.target){
              let elementLeft = $(elementItem).offset().left
              if(elementLeft<leftValue[0]){
                 leftValue[0] = elementLeft
              }

              if(elementLeft>leftValue[1]){
                 leftValue[1] = elementLeft
                 value = 0
                 value += $(elementItem).width()
              }
           }
           return value + leftValue[1] - leftValue[0]
        }
        return elementTarget.isSVG?$(elementTarget.target).get(0).getBBox().width:$(elementTarget.target).outerWidth()
    }
    getTargetHeight(elementTarget) {
        if(typeof elementTarget.target == 'object'){
           let value = 0;
           let topValue = [2000,0]
           for(let elementItem of elementTarget.target){
              let elementTop = $(elementItem).offset().top
              if(elementTop<topValue[0]){
                 topValue[0] = elementTop
              }

              if(elementTop>topValue[1]){
                 topValue[1] = elementTop
                 value = 0
                 value += $(elementItem).height()
              }
           }
           return value + topValue[1] - topValue[0]
        }
        return elementTarget.isSVG?$(elementTarget.target).get(0).getBBox().height:$(elementTarget.target).outerHeight()
    }
    getTargetTop(elementTarget) {
        if(typeof elementTarget.target == 'object'){
           let value = 2000
           for(let elementItem of elementTarget.target){
              value = $(elementItem).offset().top<value?$(elementItem).offset().top:value
           }
           return value - parseFloat(elementTarget.padding.split(' ')[0].replace('px')) - $(document).scrollTop()
        }
        return $(elementTarget.target).offset().top - parseFloat(elementTarget.padding.split(' ')[0].replace('px')) - $(document).scrollTop()
    }
    getTargetLeft(elementTarget) {
        if(typeof elementTarget.target == 'object'){
           let value = 2000
           for(let elementItem of elementTarget.target){
              value = $(elementItem).offset().left<value?$(elementItem).offset().left:value
           }
           return value - parseFloat(elementTarget.padding.split(' ')[1].replace('px'))
        }
        return $(elementTarget.target).offset().left - parseFloat(elementTarget.padding.split(' ')[1].replace('px'))
    }
}

