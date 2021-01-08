// 테트리스 조각의 로직을 구현한 스크립트입니다.
// 예시1) 조각 값 하드코딩
class Piece {
    constructor(ctx) {
        // 각 클래스는 하나의 메서드만 가질 수 있다.
        // const piece = new Piece(ctx)를 하게 되면 메서드가 실행됩니다.
        this.ctx = ctx;
        this.spawn();
        //캔버스의 Context를 받아옵니다.
        
    };


    //Spawn: 블록의 형태와 시작지점을 설정합니다.
    spawn() {
        // 블록을 생성하는 함수입니다.
        this.colorIdx = this.randomizeTetrominoType(tetroColors.length - 2) + 1;
        this.shapeIdx = this.randomizeTetrominoType(tetroShapes.length - 1);
        // color: 블록 색상
        // shape: 블록 형태 (2차원 배열형태로 구현)
        this.color = tetroColors[this.colorIdx];
        this.shape = JSON.parse(JSON.stringify(tetroShapes[this.shapeIdx]));
        this.shape.forEach( (rows, y) => {
            rows.forEach( (value, x) => {
                if ( value > 0 ) {
                    rows[x] = this.colorIdx;
                };
            });
        });
        
        this.x = cols/2 - 2;
        this.y = 0;
        // 시작위치를 다르게 설정려면 x, y값을 다르게 설정해야 한다.
    };


    // Spawn 설정값을 토대로 블록을 캔버스상에 그립니다.
    draw() {
        this.ctx.fillStyle = this.color;
        //fillStyle = color Canvas에서 도형을 채울 색상을 설정합니다. (포토샵에서 스포이드 툴을 생각하자.)
        this.shape.forEach((row, y) => {  // forEach는 매개변수로 (currentValue, index, array)를 받는다. index는 사실상 x, y 의 좌표축 값이 된다. (0,0)
            row.forEach((value, x) => { // **this 컨텍스트가 유지하려면 화살표 함수를 사용해야 합니다!! function(value, x) function(row, y)로 사용하면 this가 window에 바인딩됩니다.
                if ( value > 0 ) {
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
                    // fillRect(x, y, width, height) Canvas 에서 색칠된 사각형을 그리는 메서드.
                    // 생성된 사각형의 기본색상은 Black이다.
                    // 이전에 설정된 fillStyle값이 있다면, 그 값을 따른다. (포토샵 스포이드 툴 - 채우기 툴과 유사)
    
                    // 색칠할 위치는 배열의 좌표값을 받는다.
                    // 크기는 이후에 스케일 값을 곱하니 고려하지 않아도 된다. 단위 사각형 크기인 1 x 1로 설정할 것.
                };
            });
        });
    };


    move(p) {
        if ( !this.hardDropped ) {
            this.x = p.x;
            this.y = p.y;
        }
        this.shape = p.shape;
    }


    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes );
    };

}


