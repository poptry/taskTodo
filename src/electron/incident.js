// taskHandlers.js
const { getDatabase } = require("./database"); // 确保导入数据库模块
console.log("此处有没有在数据库初始化前");

function convertToBoolean(value) {
  return value == 1; // 将 1 转换为 true，0 转换为 false
}

// 格式化输出：YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份从0开始，需加1
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

//添加任务
async function addTasks(event, tasks) {
  let db = getDatabase();
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tasks (description,completed,created_at) VALUES (?, ?, ?);`;
    try {
      if (!db) {
        throw new Error("数据库未初始化");
      }
      db.run(
        sql,
        [tasks.description, tasks.completed, tasks.created_at],
        function (err) {
          if (err) {
            reject(err); // 如果出错，返回错误
          } else {
            resolve({ message: "插入成功", id: this.lastID }); // 返回更新结果
          }
        }
      );
    } catch (error) {
      console.error("应用初始化失败:", error);
    }
  });
}
//查询任务-all
async function getTasks(event) {
  //获取数据库实例
  let db = getDatabase();
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM tasks`;
    try {
      if (!db) {
        throw new Error("数据库未初始化");
      }
      db.all(sql, function (err, row) {
        if (err) {
          reject(err); // 如果出错，返回错误
        } else {
          row = row.map((r) => ({
            ...r,
            completed: convertToBoolean(r.completed), // 转换为布尔值
          }));
          resolve(row); // 返回更新结果
        }
      });
    } catch (error) {
      console.error("应用初始化失败:", error);
    }
  });
}
//查询任务-单个
async function getTasksByDate(event, date) {
  console.log("这是date", date);
  //获取数据库实例
  let db = getDatabase();
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM tasks where created_at = ?`;
    try {
      if (!db) {
        throw new Error("数据库未初始化");
      }
      db.all(sql, [date], function (err, row) {
        if (err) {
          reject(err); // 如果出错，返回错误
        } else {
          row = row.map((r) => ({
            ...r,
            completed: convertToBoolean(r.completed), // 转换为布尔值
          }));
          resolve(row); // 返回更新结果
        }
      });
    } catch (error) {
      console.error("应用初始化失败:", error);
    }
  });
}
//更新任务
async function updateTask(event, item) {
  let db = getDatabase();
  return new Promise((resolve, reject) => {
    const sql = `update tasks set description = ?,created_at = ?,completed = ? where id = ?`;
    const sql1 = "delete from tasks where id = ?";
    try {
      console.log("description", item.description == "");

      if (!item.description == "") {
        db.run(
          sql,
          [item.description, item.created_at, item.completed, item.id],
          (err) => {
            if (err) {
              console.log("更新任务失败", err.message);
              reject(err);
            } else {
              resolve({ msg: "更新成功", status: 200 });
            }
          }
        );
      } else {
        db.run(sql1, [item.id], (err) => {
          if (err) {
            console.log("删除失败", err.message);
            reject(err);
          } else {
            resolve({ msg: "删除成功", status: 200 });
          }
        });
      }
    } catch (error) {
      console.error("应用初始化失败:", error);
    }
  });
}
//获取图表数据
async function getGraphData(event, type) {
  //获取数据库实例
  let db = getDatabase();
  return new Promise((resolve, reject) => {
    let beforeDay = new Date();
    const currentDate = new Date();
    if (type == "7") {
      // 计算7天前的日期
      beforeDay.setDate(currentDate.getDate() - 7);
    } else {
      // 计算30天前的日期
      beforeDay.setDate(currentDate.getDate() - 30);
    }
    const date = formatDate(beforeDay);
    const today = formatDate(currentDate);
    const sql = `SELECT 
        created_at, 
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) AS uncompleted_count
      FROM tasks
      where created_at > ? and created_at <= ?
      GROUP BY created_at
      ORDER BY created_at;`;
    console.log(sql);

    try {
      if (!db) {
        throw new Error("数据库未初始化");
      }
      db.all(sql, [date, today], function (err, row) {
        if (err) {
          reject(err); // 如果出错，返回错误
        } else {
          resolve(row); // 返回更新结果
        }
      });
    } catch (error) {
      console.error("应用初始化失败:", error);
    }
  });
}
module.exports = {
  addTasks,
  getTasks,
  updateTask,
  getTasksByDate,
  getGraphData,
};
