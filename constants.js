// constant를 정의한 스크립트입니다.
// 게임설정과 규칙을 정의한 스크립트입니다.

const cols = 10;
const rows = 20;
const blocksize = 30;


// 여러 줄을 없엘 경우 추가점수를 얻습니다.
// 직전에 하드드롭을 사용하면 추가점수를 얻습니다.
const points = {
    single: 100,
    double: 300,
    triple: 500,
    tetris: 800,
    softDrop: 1,
    hardDrop: 2,
}


// 조작키를 매핑합니다.
// 키값은 코드 값으로 매핑합니다. 열거형을 사용합니다.
const key = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    esc: 27,
    space: 32,
    p: 80,
    q: 81,
}
// freeze 메서드는 대상이 된 객체, 배열을 수정할 수 없도록 합니다. seal 메서드로 해제하기 전까지 변경할 수 없습니다.
// (const로 선언한 객체에 삭제, 추가가 가능했던 것을 생각하자.)
// (단, 불변하게 하는 값은 깊이 1에서만 작동한다. 즉, 객체 내부의 객체는 여전히 수정 가능하다는 뜻이다.)


// 조각의 초기위치와 색상을 설정합니다.
const tetroColors = [
    "blank",
    "cyan",
    "blue",
    "orange",
    "yellow",
    "green",
    "purple",
    "red",
]

const tetroShapes = [
    [
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0]
    ],
    [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ],
    [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0]
    ],
    [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
    ],
    [
        [1, 1],
        [1, 1]
    ],
    [
        [1, 1, 1]
        [0, 1, 1],
        [0, 0, 0]
    ]
]

const linesPerLevel = 3;

const level = {
    0: 800,
    1: 650,
    2: 500,
    3: 350,
    4: 200,
    5: 150,
    2: 100,
    1: 50,
}

Object.freeze(key, tetroColors, tetroShapes, points, level);