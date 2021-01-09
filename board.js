// 보드 로직 스크립트입니다.

class Board {
    constructor(canvas, canvasNext) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.canvasNext = canvasNext;
        this.ctxNext = canvasNext.getContext("2d");

        this.init();
        this.initNext();
    }

    init() {
        // 캔버스 내부를 초기화하면서 크기를 설정한다.
        // 캔버스의 폭, 높이는 행 / 열 * 블록크기로 계산한다. 이는 사용자의 선택에 따른 유동성을 주기 위함.
        // 또한, 기준을 블록 사이즈로 정하여 격자형태를 명료히 규정할 수 있다.
        this.canvas.width = cols * blocksize;
        this.canvas.height = rows * blocksize;

        // sclae(x축, y축)이며, multiply 값이다. (2이면, 200%)
        // 기준은 블록크기가 되어야 한다. 따라서 스케일을 블록크기값으로 설정.
        this.ctx.scale(blocksize, blocksize);
    }

    initNext() {
        this.canvasNext.width = cols * blocksize;
        this.canvasNext.height = rows * blocksize;
        this.ctxNext.scale(blocksize, blocksize);
    }

    // 새 게임을 시작하면 보드를 초기화합니다.
    reset() {
        this.grid = this.getEmptyBoard();
        // Board.grid는 각 행과 열의 정보를 가지고 있는 배열입니다. (블록을 배열하는 판)
        // Class에서 this는 생성된 객체(인스턴스)로 바인딩됩니다.
        this.next = new Piece(this.ctxNext);
        this.ctxNext.clearRect(0, 0, canvasNext.width, canvasNext.height);
        this.next.draw();


    }

    // 0으로 채워진 행렬(cols x rows)을 생성합니다.
    getEmptyBoard() {
        return Array.from({length: rows}, (y) => Array(cols).fill(0));

        // Array.from: 입력받은 배열의 "length"속성을 가져온다. 따라서 fake Array {length: rows}로 만들면. 객체의 length 속성을 가져온다.
        // 매개변수는 arrayLike, mapFn, thisArg이다.

        // 길이가 rows인 배열을 하나 생성한다.
        // Array(정수)는 값이 들어가있지 않은 길이가 정수인 배열을 생성한다.
        // Array.fill은 내부의 값들을 인자의 값으로 바꾼 배열을 반환한다. Array(cols).fill(0)은 길이가 cols인 배열을 0으로 채우는 것이다.
    }



    // 테트리미노가 이동할 위치가 유효한지 판정합니다.
    // 1. 다른 조각에 닿았는가
    // 2. 화면 밖으로 나가는가
    // 3. 바닥에 닿았는가
    // 4. **회전 중에 벽 또는 다른 블록과 충돌이 일어나는가.
    valid(p) { 
        return p.shape.every( (row, dy) => { // every는 배열 내 모든 element가 true이면 true, 아니면 false반환.
            return row.every( (value, dx) => { // 매개인자는 (currentValue, index, array)
                let x = p.x + dx;
                let y = p.y + dy;
                return ( 
                    // 블록이 없는 경우 value === 0이므로, true 반환. 없으면, insideWall, aboveFloor 여부 확인하여 true / false 반환.
                    value === 0 || (this.isInsideWalls(x,y) && this.isNotOccupied(x,y))
                );
            })
        })
    }

    isInsideWalls(x, y) {
        return x>= 0 && x < cols && y <= rows;
    }

    isNotOccupied(x, y) {
        // grid는 2차원 배열이다. (grid[y][x], grid[y])로 표기할 수 있다.
        // (x, y) 좌표값을 확인한다. 0보다 크면 다른 블록이 점유하고 있으므로 이동할 수 없다.
        return this.grid[y] && this.grid[y][x] === 0;
    }

    rotate(piece, direction) {
        //원본 회손을 방지하고자 복사합니다.
        let p = JSON.parse(JSON.stringify(this.piece));
        if (!piece.hardDropped) {
            for ( let y = 0; y < p.shape.length; ++y ) {
                for ( let x = 0; x < y; ++x ) {
                    [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]]
                }
            }
            if ( direction === "rotationRight" ) {
                p.shape.forEach((row) => row.reverse());
            }
            else if ( direction === "rotationLeft" ) {
                p.shape.reverse();
            }
        }
        return p;
    }

    getNewPiece() {
        const {width, height} = this.ctxNext.canvas;
        this.next = new Piece(this.ctxNext);
        this.ctxNext.clearRect(0, 0, width, height);
        this.next.draw();
    }

    draw() {
        this.piece.draw();
        this.drawBoard();
    }


    freeze() {
        // 블록이 더 이상 움직일 수 없을경우, 보드에 병합시키는 함수.
        this.piece.shape.forEach( (row, y) => {
            row.forEach( (value, x) => {
                if ( value > 0 ) {
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
                };
            });
        });
    }


    drop() {
        let p = moves[key.down](this.piece);
        // 블록이 일정시간마다 자동으로 내려가게 하는 함수입니다.
        // 아래로 내려가도록 하는 원리는 아래 방향키를 눌렀을 때와 유사합니다.
        if (this.valid(p)) {
            this.piece.move(p);
        }
        else {
            this.freeze();
            // freeze함수는 해당 블록을 고정하고 board에 병합시킵니다.
            this.clearLines();
            // 블록이 떨어지고나면, 줄이 있는 확인하여 제거 / 이동합니다.
            if ( this.piece.y === 0 ) {
                // 천장에 닿았으므로 Game Over입니다.
                return false;
            }
            this.piece = this.next;
            this.piece.ctx = this.ctx;
            // this.piece.setStartingPosition();
            this.getNewPiece();
        }
        return true;
    }

    clearLines() {
        let lines = 0;
        this.grid.forEach( (row, y) => {
            if ( row.every( (value) => value > 0 )) {
                lines++;

                this.grid.splice(y, 1); // idx = y인 row를 제거합니다.

                this.grid.unshift(Array(cols).fill(0)); // 최상단에 0으로 채워진 row를 추가합니다.
            }
        })
        if ( lines > 0 ) {
            account.score += this.getLineClearPoints(lines);
            account.lines += lines;

            if ( account.lines >= linesPerLevel ) {
                account.level++;
                account.lines -= linesPerLevel;
                time.level = level[account.level]
            }
        }
    }

    getLineClearPoints(lines) {
        // 줄을 없엘 때마다 얻는 점수를 정의한 함수입니다.
        return lines === 1 ? points.single :
               lines === 2 ? points.double :
               lines === 3 ? points.triple :
               lines === 4 ? points.tetris :
               0;
    };


    drawBoard() {
        this.grid.forEach( (row, y) => {
            row.forEach( (value, x) => {
                if ( value > 0 ) {
                    this.ctx.fillStyle = tetroColors[value];
                    this.ctx.fillRect(x, y, 1, 1);
                };
            });
        });
    };







}

