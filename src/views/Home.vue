<template>
  <div class="container">
    <!-- 首页，展示目录 -->
    <!-- 首先是一个看板用于按年、月、星期记录自己的targets完成情况 -->
    <el-row
      style="background-color: #996699;height: 50px;line-height: 50px;border-radius:10px;margin-bottom: 20px;">
      <span style="color: #fff;margin-left: 20px;"><i class="el-icon-data-analysis"></i>统计</span>
    </el-row>
    <div style="width: 90%; margin: 0 auto; display: flex;flex-direction: row;justify-content: flex-end;
      align-items: center;">
      <el-radio-group v-model="type" size="mini" @input="changeRadio">
        <el-radio-button label="7"><span>近7天</span></el-radio-button>
        <el-radio-button label="30"><span>近30天</span></el-radio-button>
      </el-radio-group>
      <span class="refresh" contenteditable="false" @click="changeRadio"><i
          class="el-icon-refresh"></i></span>
    </div>
    <el-row>
      <el-col :span="24">
        <div class="line-graph" id="graph" style="height: 300px;width: 90%;"></div>
      </el-col>
    </el-row>
    <!-- 然后是一个calendar，
   用户每天第一次打开应用，创建当天的targets，
   完成一个需要去勾选它，然后可以写上建议
   未完成的，可以编写未完成的原因截至时间为当天的24：00-->
    <el-row style="background-color: #0099CC;height: 50px;line-height: 50px;border-radius:10px;">
      <span style="color: #fff;margin-left: 20px;"><i class="el-icon-date"></i>日历本</span>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-calendar class="calendar" v-model="value" style="width: 100%;">
          <!-- 这里使用的是 2.5 slot 语法，对于新项目请使用 2.6 slot 语法-->
          <template slot="dateCell" slot-scope="{date, data}">
            <div :class="data.isSelected ? 'is-selected' : ''" @click="clickDay(data)">
              {{ data.day.split('-').slice(2).join('-')  }}
            </div>
            <el-popover v-if="allTasks.length!=0 && uniqueDate.length!=0" placement="top-start"
              title="任务" width="200" trigger="hover">
              <div class="poperBox">
                <div v-for="task in allTasks" :key="task.id"
                  v-if="task.created_at.split(' ')[0] == data.day" class="poperBoxItem">
                  <span :class="task.completed ? `compeleteItem` : ''">{{task.description}}</span>
                </div>
              </div>
              <div slot="reference">
                <span v-for="item in uniqueDate" :key="item.created_at"
                  v-if="item.created_at.split(' ')[0]== data.day" @click="clickDay(data)">
                  <i class="el-icon-edit"></i>
                </span>
              </div>
            </el-popover>
          </template>
        </el-calendar>
      </el-col>
    </el-row>
    <el-dialog title="今日任务" :visible.sync="dialogTableVisible" width="50%" @closed="closeDialog">
      <div class="createTask">
        <div class="inputask" v-for="item,index in tasks" :key="index">
          <!-- 输入框 -->
          <div class="inputgroup">
            <input required="" class="input" type="text" v-model="item.description" maxlength="20"
              @blur="saveTasks(item)" @input="charlength = item.description.length">
            <span class="highlight"></span>
            <span class="bar"></span>
            <label>任务描述</label>
          </div>
          <span class="charCheck">{{item.description.length || charlength}}/20</span>
          <el-checkbox class="checkbox" @change="saveTasks(item)" v-model="item.completed"
            size="medium">完成</el-checkbox>
        </div>
        <!-- 添加任务 -->
        <div class="addTakes" @click="addTasks"><i class="el-icon-plus"></i></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  data() {
    return {
      value: new Date(),
      dialogTableVisible: false,
      allTasks: [],
      tasks: [],
      thisDate: "",
      type: "7",
      graphData: [],
      myChart: null,
      uniqueDate: [],
      charlength: 0,
    };
  },
  methods: {
    //点击日期后弹窗事件
    async clickDay(data) {
      this.thisDate = data.day;
      //获取任务
      let res = await window.api.getTasksByDate(this.thisDate);
      if (res.length == 0) {
        this.tasks.push({
          completed: false,
          description: "",
          created_at: "",
        });
      } else {
        this.tasks = res;
      }
      this.dialogTableVisible = true;
    },
    //新增任务
    addTasks() {
      this.tasks.push({
        completed: false,
        description: "",
      });
    },
    //失去焦点保存
    async saveTasks(item) {
      // 一种是保存，没有之前的消息
      //id存在则更新，id不存在则是保存
      if (item.id) {
        //更新
        const res = await window.api.updateTaks(item);
        console.log(res);
        //调用一次查询全部,更新日历状态
        this.getAllTasks();
      }
      if (!item.id && item.description !== "") {
        item.created_at = this.thisDate;
        const res = await window.api.addTasksDB(item);
        console.log("添加结果", res);
        item.id = res.id;
        //调用一次查询全部,更新日历状态
        this.getAllTasks();
      }
    },
    // 关闭弹窗
    async closeDialog() {
      this.tasks = [];
      this.getAllTasks();
    },
    //图表日期范围更换
    async changeRadio() {
      let res = await window.api.getGraphData(this.type);
      this.graphData = res;
      this.myChart.setOption({
        dataset: {
          source: [...this.graphData],
        },
      });
    },
    //数组对象根据created_at去重
    removeTheSame(arr) {
      let uniqueMap = new Map(arr.map((item) => [item.created_at, item]));
      return Array.from(uniqueMap.values());
    },
    //获取所有的任务
    async getAllTasks() {
      let res = await window.api.getTasksDB(); //请求
      this.allTasks = res; //存储
      this.uniqueDate = this.removeTheSame(this.allTasks); //去重
    },
  },
  async mounted() {
    //调用一个查询，初始化日历
    this.getAllTasks();
    // 基于准备好的dom，初始化echarts实例
    this.myChart = echarts.init(document.getElementById("graph"));
    let option = {
      tooltip: {
        trigger: "axis",
      },
      dataset: {
        source: [],
      },
      legend: {
        data: ["compeleted", "uncompeleted"],
      },
      xAxis: {
        type: "category",
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "compeleted",
          type: "line",
          stack: "Total",
          color: ["#0C9CEB", "#E8772E"],
        },
        {
          name: "uncompeleted",
          type: "line",
          stack: "Total",
          color: ["#E8772E", "#0C9CEB", "#7289ab", "#91ca8c", "#f49f42"],
        },
      ],
    };
    // 绘制图表
    option && this.myChart.setOption(option);
    window.addEventListener("resize", () => {
      this.myChart.resize();
    });
    this.changeRadio(); //初始化图表
  },
};
</script>

<style lang="less">
.is-selected {
  color: #336699;
}
.poperBox {
  max-height: 100px;
  overflow-y: auto;
  padding-right: 5px;
  .poperBoxItem {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    .compeleteItem {
      text-decoration: line-through;
      color: #b6b6b6;
      font-size: 13px;
    }
  }
  /* 设置滚动条的宽度 */
  &::-webkit-scrollbar {
    width: 8px; /* 垂直滚动条 */
    height: 8px; /* 水平滚动条 */
  }

  /* 设置滚动条的轨道（背景） */
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1d2;
    border-radius: 10px;
  }

  /* 设置滚动条的滑块（可拖动部分） */
  &::-webkit-scrollbar-thumb {
    background-color: #d4d4d4;
    border-radius: 10px;
  }

  /* 设置鼠标悬停时滚动条的样式 */
  &::-webkit-scrollbar-thumb:hover {
    background-color: #bcbcbc;
  }
}
.refresh {
  padding: 0 5px;
  margin-left: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.4s ease;
  caret-color: transparent;
  &:hover {
    color: #9d57ff;
  }
  &:active,
  &:focus {
    color: #999;
    transform: rotate(360deg);
  }
}
.container {
  height: 100%;
  width: 100%;
  padding: 20px;
  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none; /* 隐藏滚动条 */
  }
  .line-graph,
  .calendar {
    margin: 0 auto;
  }
  .el-row {
    width: 90%;
    margin: 0 auto;
  }
  .inputask {
    margin-bottom: 20px;
  }
}
.el-dialog {
  min-height: 200px;
  max-height: 400px;
  overflow: auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0px !important;
  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none; /* 隐藏滚动条 */
  }
  .el-dialog__body {
    padding-top: 15px;
  }
  .inputask {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .checkbox {
      font-size: 16px;
      width: 15%;
    }
    .charCheck {
      display: inline-block;
      width: 10%;
      font-size: 12px;
      color: #d2d2d2;
      text-align: center;
    }
  }
  .inputgroup {
    position: relative;
    width: 75%;
    .input {
      font-size: 16px;
      padding: 10px 10px 10px 5px;
      display: block;
      width: 100%;
      border: none;
      border-bottom: 1px solid #7c7c7c;
      background: transparent;
      &:focus {
        outline: none;
      }
      &:focus ~ label,
      &:valid ~ label {
        top: -15px;
        font-size: 14px;
        color: #6666cc;
      }
    }
    label {
      position: absolute;
      color: #999;
      left: 5px;
      top: 10px;
      font-size: 18px;
      border: none;
      pointer-events: none;
      transition: 0.2s ease all;
    }
    .bar {
      position: relative;
      display: block;
      width: 100%;
    }
    .bar:before,
    .bar:after {
      content: "";
      height: 2px;
      width: 0;
      bottom: 1px;
      position: absolute;
      background: #6666cc;
      transition: 0.2s ease all;
      -moz-transition: 0.2s ease all;
      -webkit-transition: 0.2s ease all;
    }
    .bar:before {
      left: 50%;
    }
    .bar:after {
      right: 50%;
    }
    .input:focus ~ .bar:before,
    .input:focus ~ .bar:after {
      width: 50%;
    }
    .highlight {
      position: absolute;
      height: 60%;
      width: 100px;
      top: 25%;
      left: 0;
      pointer-events: none;
      opacity: 0.5;
    }
    .input:focus ~ .highlight {
      animation: inputHighlighter 0.3s ease;
    }
  }
  .addTakes {
    margin-top: 10px;
    font-size: 24px;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
    &:hover {
      i {
        color: #5d5dfc;
      }
    }
  }
}
.el-calendar {
  .el-button:focus,
  .el-button:hover {
    color: #f3f4f7;
    background-color: #336699;
  }
  .el-calendar__title {
    color: #336699;
    font-weight: 600;
  }
}
.el-dialog {
  background: linear-gradient(135deg, #f0f0f0 30%, #eeeeff 95%) !important;
  box-shadow: 5px 5px 0px #b0b0e3, -5px -5px 0px #c8c8eb !important;
}
.el-dialog__headerbtn .el-dialog__close {
  color: #b2b2ff !important;
  &:hover {
    color: #4a4ad7 !important;
  }
}
@keyframes inputHighlighter {
  from {
    background: #5264ae;
  }

  to {
    width: 0;
    background: transparent;
  }
}
</style>