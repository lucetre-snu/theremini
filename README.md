# ThereMINI

![3-작품사진](https://user-images.githubusercontent.com/26702243/189478382-3fa12035-69ea-496a-a21c-a85be139d0cf.png)

### Introduction
- We mimicked “theremin,” an electronic musical instrument controlled without physical contact, by utilizing Arduino sensors within 1/10x expense of sales price.
- 1928년에 발명된 테레민은 연주자의 육체적 접촉이 필요 없이 작동되는 전자 악기입니다. 악기의 양쪽에 위치하는 두 개의 안테나에서 발생되는 전자기장을 손으로 간섭시켜 소리를 내는데 연주 방식이 신기한 만큼 많은 사람의 관심을 받고 있습니다. 50만원에서 200만원까지 판매되고 있는 테레민을 아두이노 센서를 가지고 저렴한 가격에 보다 여러 가지 악기 음을 낼 수 있도록 향상해 제작하였습니다. 음정을 계산할 초음파 센서와 볼륨을 조절할 가변저항, 그리고 악기의 종류를 선택할 적외선 센서를 사용해 실시간 데이터베이스에 출력할 소리를 요청합니다. 클라우드 메시징을 통해 해당하는 소리를 사이트에서 재생합니다. 웹 소켓으로 처리하여 아두이노로부터 받은 소리뿐만 아니라 동시 접속한 사람들 이 연주하는 소리를 함께 재생할 수 있습니다.

### Deployments
- ~~[theremini.herokuapp.com](http://theremini.herokuapp.com)~~
  - Deployed June, 2022
  - Outdated due to Heroku's no free-tier policy
- **[theremini.up.railway.app](https://theremini.up.railway.app/)**
  - Deployed September, 2022
