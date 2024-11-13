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
.el-radio-button__inner:hover {
  color: #a958eb !important;
}
.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background-color: #9367c5 !important;
  border-color: #f0c1e1 !important;
  box-shadow: -1px 0 0 0 #b362fa !important;
  user-select: none;
  &:hover {
    color: #ffffff !important;
  }
}
.el-radio-button:focus:not(.is-focus):not(:active):not(.is-disabled) {
  box-shadow: none !important;
}
.el-backtop,
.el-calendar-table td.is-today {
  color: #336699 !important;
}
</style>