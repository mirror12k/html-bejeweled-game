
$(function ($) {
	// initialize board
	var board_size_x = 5;
	var board_size_y = 5;
	var board = [];
	for (var y = 0; y < board_size_y; y++) {
		board[y] = [];
		for (var x = 0; x < board_size_x; x++) {
			board[y][x] = undefined;
		}
	}

	// add proper building for the board
	var box = $('.box');

	for (var y = 0; y < board_size_y; y++) {
		var row = $('<div class="box-row"></div>');
		for (var x = 0; x < board_size_x; x++) {
			row.append('<div class="box-cell box-cell-' + x + '-' + (board_size_y - y - 1)
					+ '" data-cell-x="' + x + '" data-cell-y="' + (board_size_y - y - 1) + '"></div>');
		}
		box.append(row);
	}

	function on_clicked(x, y) {
		board[y][x].remove();
		board[y][x] = undefined;
	}

	function create_box_item () {
		var box_item = $('<div class="box-item"></div>');

		box_item.click(function (e) {
			var cell = box_item.parent();
			var x = cell.data('cell-x');
			var y = cell.data('cell-y');
			
			on_clicked(x,y);
		});

		return box_item;
	}

	// gradual row-filling function
	var current_fill_row = -1;
	function fill_row(x) {

		var y;
		for (y = board_size_y - 1; y >= 0; y--) {
			if (board[y][x] !== undefined) {
				break;
			}
		}
		y++;

		console.log("placing a new box item at ", x, y);
		var dist = (board_size_y - y) * 80;
		board[y][x] = create_box_item();
		board[y][x].addClass('box-drop-' + dist);
		box.find('.box-cell-' + x + '-' + y).append(board[y][x]);
	}

	function update_board() {

		var incomplete_rows = [];

		// drop any items that have empty space under them
		for (var x = 0; x < board_size_x; x++) {
			for (var y = 0; y < board_size_y; y++) {
				if (board[y][x] === undefined) {
					var found = false;
					for (var y2 = y + 1; y2 < board_size_y; y2++) {
						if (board[y2][x] !== undefined) {
							board[y][x] = board[y2][x];
							board[y2][x] = undefined;

							var dist = (y2 - y) * 80;

							box.remove('.box-cell-' + x + '-' + y2);
							box.find('.box-cell-' + x + '-' + y).append(board[y][x]);
							board[y][x].removeClass();
							board[y][x].addClass('box-item box-drop-' + dist);

							found = true;
							break;
						}
					}

					if (found === false) {
						// stop parsing this row if we have nothing to fill the slots with
						incomplete_rows[x] = true;
						break;
					}
				}
			}
		}

		if (incomplete_rows[current_fill_row] === true) {
			fill_row(current_fill_row);
		}

		// increment row
		if (++current_fill_row > board_size_x) {
			current_fill_row = 0;
		}
	}

	// trigger row filling on interval
	setInterval(update_board, 100);

});

