<template>
  <div class="ticontainer">
    <div class="tiblock">
      <div class="tidot"></div>
      <div class="tidot"></div>
      <div class="tidot"></div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.ticontainer {
  display: inline-block;

  .tiblock {
    align-items: center;
    display: flex;
    height: 17px;

    .tidot {
      background-color: #90949c;
      animation: mercuryTypingAnimation 1.5s infinite ease-in-out;
      -webkit-animation: mercuryTypingAnimation 1.5s infinite ease-in-out;
      border-radius: 2px;
      display: inline-block;
      height: 4px;
      margin-right: 2px;
      width: 4px;

      &:nth-child(1) {
        animation-delay: 200ms;
        -webkit-animation-delay: 200ms;
      }
      &:nth-child(2) {
        animation-delay: 300ms;
        -webkit-animation-delay: 300ms;
      }
      &:nth-child(3) {
        animation-delay: 400ms;
        -webkit-animation-delay: 400ms;
      }
    }
  }
}

@keyframes mercuryTypingAnimation {
  0% {
    transform: translateY(0px);
  }
  28% {
    transform: translateY(-5px);
  }
  44% {
    transform: translateY(0px);
  }
}

@-webkit-keyframes mercuryTypingAnimation {
  0% {
    -webkit-transform: translateY(0px);
  }
  28% {
    -webkit-transform: translateY(-5px);
  }
  44% {
    -webkit-transform: translateY(0px);
  }
}
</style>
