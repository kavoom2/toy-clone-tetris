// 게임 초기화와 종료 로직을 구현한 코드입니다.

let time;
let requestID;

//test

// 캔버스 사이즈 설정 
const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
// canvas의 컨텍스트는 그리기 영역이며, 그리기 메서드를 가지고 있다. getContext 메서드로 켄버스의 컨텍스트를 호출한다.

const canvasNext = document.querySelector("#next");
const ctxNext = canvasNext.getContext("2d");


// 보드 초기화 함수
let board = new Board(canvas, canvasNext);

// 사용자 계정생성
let accountValues = {
    score: 0,
    lines: 0,
    level: 0,
}

function updateAccount(key, value) {
    let element = document.querySelector(`#${key}`);
    if ( element ) {
        element.textContent = value;
    }
}

let account = new Proxy(accountValues, {
    // Proxy는 객체의 속성 조회, 할당, 순회, 함수호출 등 동작을 인터셉트하여 부가적인 행동을 정의할 수 있습니다.
    // Proxy(target, handler) - target: 대상객체, handler - 객체의 기본동작이 수행되면 수행할 함수"객체"
    // accountValues가 커스텀 동작을 가지는 객체가 됩니다.
    set: (target, key, value) => {
        target[key] = value; // 프록시 호출로 직접 객체에 키/값을 할당할 수 없기 때문에, handler 내부에 다음과 같은 코드를 적어야 합니다.
        updateAccount(key,value);
        return true;
        // handler.set()은 "할당"할 때만 작동합니다.
        // 할당이 성공했으면 return true
        // 엄격모드에서 return false를 반환하면 TypeError가 발생합니다.
    }
});


// 버튼 클릭시 초기화 실행 함수. 버튼에 play함수가 onclick으로 할당되어 있다.
function play() {
    addEventListener();
    resetGame();

    let piece = new Piece(ctx);
    piece.draw();
    board.piece = piece;
    animate()
};

function resetGame() {
    account.score = 0;
    account.lines = 0;
    account.level = 0;
    board.reset();
    time = {start: performance.now(), elapsed: 0, level: level[account.level]};
}

function gameOver() {
    cancelAnimationFrame(requestID);
    // requestID의 프레임 반복을 중단합니다.
    ctx.fillStyle = "black";
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = "1px Arial";
    ctx.fillStyle = "red"
    ctx.fillText("GAME OVER", 1.8, 4);
}



function animate( now = 0 ) {
    // now = 0의 의미는, 별도로 값을 넣지 않은 경우 기본값인 0을 사용한다는 의미입니다.
    time.elapsed = now - time.start;
    if ( time.elapsed > time.level ) {
        // 시간 단위는 ms입니다. 1000ms = 1s. 즉 (time.level / 1000)초마다 변경된 프레임을 그립니다.
        time.start = now;
        if ( !board.drop() ) {
            gameOver();
            return;
            // return하여 애니메이션 반복을 종료합니다.
        }
        board.drop();
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    board.draw();
    // requestAnimationFrame()은 1 프레임만 보여줍니다.
    // timeStamp 기준이 명확하지 않을경우 사용자의 모니터 주사율에 따라 속도가 달라집니다
    // (같은 10장을 보여주더라도 60프레임과 120프레임의 시간은 다릅니다.)
    // 애니메이션이 반복적으로 실행되려면, 재귀적으로 호출하여야 합니다.
    requestID = requestAnimationFrame(animate);
}


// 키를 매핑합니다.
const moves = {
    [key.left]: p => ({...p, x: p.x - 1}),
    [key.right]: p => ({...p, x: p.x + 1}),
    [key.down]: p => ({...p, y: p.y + 1}),
    [key.space]: p => ({...p, y: p.y + 1}),
    [key.up]: (p) => board.rotate(p, "rotationRight"),
    [key.q]: (p) => board.rotate(p, "rotationLeft"),
    // this 바인딩의 컨텍스트가 전역으로 변경되지 않도록 화살표 함수를 사용한다
    // 객체 안에서 spread syntax를 사용하면 merge Object를 한 것. 
    // 중복되는 키가 있다면 후자가 우선권을 가진다. (동일한 key값이 있다면 후자 value로 덮어씌움)

}

// 자동으로 블록을 내려가게 하는 함수


function addEventListener() {
    document.removeEventListener("keydown", handleKeyPress);
    document.addEventListener("keydown", handleKeyPress);
};

function handleKeyPress(event) {
    if ( event.keyCode === key.p ) {
        // pause();
    }
    else if ( event.keyCode === key.esc ) {
        // gameOver();
    }
    else if ( moves[event.keyCode] ) {
        event.preventDefault()
        let p = moves[event.keyCode](board.piece);
        // 1. space: hardDrop
        if ( event.keyCode === key.space ) {
            while (board.valid(p)) {
                account.score += points.hardDrop;
                board.piece.move(p);
                p = moves[key.space](board.piece);
            }
        }
        // 2. arrowKey : move a tetromino
        else if (board.valid(p)) {
            board.piece.move(p);
            if ( event.keyCode === key.down ) {
                account.score += points.softDrop;
            }
        }
    }
}



// document.addEventListener("keydown", event => {
//     if ( event.keyCode === key.space ) {
//         let p = moves[key.space](board.piece)
//         while (board.valid(p) ) {
//             board.piece.move(p);
//             p = moves[key.space](board.piece)
//         }
//         ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//         board.piece.draw();
//     }

//     if ( moves[event.keyCode] ) { // event.keyCode는 ASCII 값. 특정 키가 입력되었을 때만 작동하도록 한다.
//         // 이벤트 버블링 방지
//         event.preventDefault();

//         // 방향키에 맞게, 블록의 위치를 바꾸어 준다. (p.x, p.y만 변경된다.)
//         const p = moves[event.keyCode](board.piece);


//         if ( board.valid(p) ) {
//             // 이동이 가능한 상태이면 조각을 움직인다.
            
//             board.piece.move(p);

//             // 그리기 전에 이전 좌표를 지운다.
//             ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//             //이동된 좌표로 다시 그린다.
//             board.piece.draw();
//         };
//     };
// });

