




$(function ($) {



	function rand_int (min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}




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

	// row-filling function which creates a new box which drops into place
	var current_fill_row = -1;

	// available box colors
	var colors = [
		'red',
		'yellow',
		'green',
		'blue',
		'purple',
	];

	// add proper building for the board
	var box = $('.box');

	for (var y = 0; y < board_size_y; y++) {
		var row = $('<div class="box-row"></div>');
		for (var x = 0; x < board_size_x; x++) {
			var cell = $('<div class="box-cell box-cell-' + x + '-' + (board_size_y - y - 1)
					+ '" data-cell-x="' + x + '" data-cell-y="' + (board_size_y - y - 1) + '"></div>');

			cell.click((function (x, y, e) {
				on_cell_clicked(x,y);
			}).bind(undefined, x, board_size_y - y - 1));

			row.append(cell);
		}
		box.append(row);
	}

	// is the x,y coordinate in bounds?
	function is_in_bounds(x,y) {
		if (x < 0 || y < 0 || x >= board_size_x || y >= board_size_y)
			return false;
		else
			return true;
	}

	var selected_x, selected_y;

	// called when a tile is clicked
	function on_cell_clicked(x, y) {
		// // remove tile on click
		// board[y][x].remove();
		// board[y][x] = undefined;

		if (selected_x === undefined) {
			selected_x = x;
			selected_y = y;
		} else {
			var dist = Math.abs(selected_x - x) + Math.abs(selected_y - y);
			console.log('x,y: ', selected_x, selected_y, x, y);
			console.log('distance: ', dist);
			if (dist === 1) {
				board[y][x].remove();
				board[selected_y][selected_x].remove();

				if (selected_x !== x) {
					if (selected_x < x) {
						add_animation(board[y][x], 'box-shift-left-80');
						add_animation(board[selected_y][selected_x], 'box-shift-right-80');
					} else {
						add_animation(board[y][x], 'box-shift-right-80');
						add_animation(board[selected_y][selected_x], 'box-shift-left-80');
					}
				} else {
					if (selected_y < y) {
						add_animation(board[y][x], 'box-shift-up-80');
						add_animation(board[selected_y][selected_x], 'box-shift-down-80');
					} else {
						add_animation(board[y][x], 'box-shift-down-80');
						add_animation(board[selected_y][selected_x], 'box-shift-up-80');
					}
				}

				var swap = board[y][x];
				board[y][x] = board[selected_y][selected_x];
				board[selected_y][selected_x] = swap;

				append_to_cell(x, y, board[y][x]);
				append_to_cell(selected_x, selected_y, board[selected_y][selected_x]);
			}

			selected_x = undefined;
			selected_y = undefined;
		}
	}

	// create a new box
	function create_box_item () {
		var box_item = $('<div class="box-item"></div>');

		var box_color = colors[rand_int(0, colors.length)];
		console.log("debug box_color: " + box_color);
		box_item.addClass('box-item-' + box_color);
		box_item.attr('data-box-color', box_color);

		return box_item;
	}

	function add_animation(item, animation) {
		item.removeClass();
		item.addClass('box-item box-item-' + item.data('box-color') + ' ' + animation);
	}


	function append_to_cell(x, y, item) {
		box.find('.box-cell-' + x + '-' + y).append(item);
	}

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
		add_animation(board[y][x], 'box-drop-' + dist);
		append_to_cell(x, y, board[y][x]);
	}


	// update the board by dropping down floating tiles and adding new ones where necessary
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

							// box.find('.box-cell-' + x + '-' + y2).remove(board[y2][x]);
							board[y][x].remove();
							add_animation(board[y][x], 'box-drop-' + dist);
							append_to_cell(x, y, board[y][x]);

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

		// add a block to the row if it's incomplete
		if (incomplete_rows[current_fill_row] === true) {
			fill_row(current_fill_row);
		}

		// increment row
		if (++current_fill_row > board_size_x) {
			current_fill_row = 0;
		}
	}

	// trigger updates on interval
	setInterval(update_board, 100);

});

