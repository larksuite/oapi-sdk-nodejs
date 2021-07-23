cd packages

cd core
npm install
npm link

cd ../api
npm link @larksuiteoapi/core
npm install
npm link

cd ../event
npm link @larksuiteoapi/core
npm install
npm link

cd ../card
npm link @larksuiteoapi/core
npm install
npm link

cd ../allcore
npm link @larksuiteoapi/core
npm link @larksuiteoapi/api
npm link @larksuiteoapi/event
npm link @larksuiteoapi/card
npm install
npm link

cd ../sample
npm link @larksuiteoapi/allcore
npm install
