<template>
  <Main></Main>
</template>

<script>
import Main from "./views/Main.vue";
export default {
  components: { Main },
};
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #5b5bdb !important;
  border-color: #36367b !important;
}
.el-checkbox__input.is-checked + .el-checkbox__label {
  color: #5b5bdb !important;
}
.el-checkbox__input.is-focus .el-checkbox__inner {
  border-color: #7f7fff !important;
}
.el-dialog__title {
  color: #2f2fad !important;
  font-weight: 550;
}
</style>