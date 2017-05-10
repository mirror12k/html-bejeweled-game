




$(function ($) {



	function rand_int (min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}


	// settings

	// initialize board
	var board_size_x = 8;
	var board_size_y = 8;
	var board = [];
	for (var y = 0; y < board_size_y; y++) {
		board[y] = [];
		for (var x = 0; x < board_size_x; x++) {
			board[y][x] = undefined;
		}
	}

	// how many blocks in a row are needed to create a match
	var match_length_required = 3;

	// available box colors
	var colors = [
		'red',
		'orange',
		'yellow',
		'green',
		'blue',
		'purple',
	];
	var rare_colors = [
		'rainbow',
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

			cell.mousedown((function (x, y, e) {
				e.preventDefault();
				e.stopPropagation();
				// console.log('mouse down: ', x,y);
				cell_drag_selected_x = x;
				cell_drag_selected_y = y;
			}).bind(undefined, x, board_size_y - y - 1));

			cell.mouseup((function (x, y, e) {
				e.preventDefault();
				e.stopPropagation();
				if (cell_drag_selected_x !== undefined && cell_drag_selected_y !== undefined) {
					// console.log('mouse up: ', x,y);
					on_cell_dragged(cell_drag_selected_x, cell_drag_selected_y, x, y);
					cell_drag_selected_x = undefined;
					cell_drag_selected_y = undefined;
				}
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

	function swap_adjacent_tiles (x1, y1, x2, y2) {
		board[y2][x2].remove();
		board[y1][x1].remove();

		if (x1 !== x2) {
			if (x1 < x2) {
				add_animation(board[y2][x2], 'box-shift-left');
				add_animation(board[y1][x1], 'box-shift-right');
			} else {
				add_animation(board[y2][x2], 'box-shift-right');
				add_animation(board[y1][x1], 'box-shift-left');
			}
		} else {
			if (y1 < y2) {
				add_animation(board[y2][x2], 'box-shift-up');
				add_animation(board[y1][x1], 'box-shift-down');
			} else {
				add_animation(board[y2][x2], 'box-shift-down');
				add_animation(board[y1][x1], 'box-shift-up');
			}
		}

		var swap = board[y2][x2];
		board[y2][x2] = board[y1][x1];
		board[y1][x1] = swap;

		append_to_cell(x2, y2, board[y2][x2]);
		append_to_cell(x1, y1, board[y1][x1]);

	}

	var selected_x, selected_y;

	// called when a tile is clicked
	function on_cell_clicked(x, y) {
		// // remove tile on click
		// board[y][x].remove();
		// board[y][x] = undefined;

		// click swap tiles
		if (selected_x === undefined) {
			selected_x = x;
			selected_y = y;
		} else {
			var dist = Math.abs(selected_x - x) + Math.abs(selected_y - y);
			// console.log('x,y: ', selected_x, selected_y, x, y);
			// console.log('distance: ', dist);
			if (dist === 1) {
				swap_adjacent_tiles(selected_x, selected_y, x, y);
			}

			selected_x = undefined;
			selected_y = undefined;
		}
	}

	function on_cell_dragged(from_x, from_y, to_x, to_y) {
		var dist = Math.abs(from_x - to_x) + Math.abs(from_y - to_y);
		if (dist === 1) {
			swap_adjacent_tiles(from_x, from_y, to_x, to_y);
		} else if (dist > 0) {
			if (Math.abs(from_x - to_x) > Math.abs(from_y - to_y)) {
				// x-plane move
				if (from_x > to_x)
					swap_adjacent_tiles(from_x, from_y, from_x - 1, from_y);
				else
					swap_adjacent_tiles(from_x, from_y, from_x + 1, from_y);
			} else {
				// y-plane move
				if (from_y > to_y)
					swap_adjacent_tiles(from_x, from_y, from_x, from_y - 1);
				else
					swap_adjacent_tiles(from_x, from_y, from_x, from_y + 1);
			}
		}
	}

	// create a new box
	function create_box_item () {
		var box_item = $('<div class="box-item-container"><div class="box-item"></div></div>');

		var box_color;
		if (rand_int(0, 50) === 0) {
			box_color = rare_colors[rand_int(0, rare_colors.length)];
		} else {
			box_color = colors[rand_int(0, colors.length)];
		}
		// console.log("debug box_color: " + box_color);
		box_item.find('.box-item').addClass('box-item-' + box_color);
		box_item.attr('data-box-color', box_color);

		return box_item;
	}

	function add_animation(item, animation) {
		item.removeClass();
		item.addClass('box-item-container' + ' ' + animation);
		item.attr('data-is-animating', 'true');
		item.one("animationend", function(e) {
			// console.log('animationend ' + animation + ' complete!');
			item.data('is-animating', 'false');
			// console.log('is-animating: ' + item.data('is-animating'));
		});
	}


	function append_to_cell(x, y, item) {
		box.find('.box-cell-' + x + '-' + y).append(item);
	}

	function delete_cell(x, y) {
		if (board[y][x] !== undefined) {
			board[y][x].remove();
			board[y][x] = undefined;
		}
	}

	function fill_row(x) {

		var y;
		for (y = board_size_y - 1; y >= 0; y--) {
			if (board[y][x] !== undefined) {
				break;
			}
		}
		y++;

		// console.log("debug placing a new box item at ", x, y);
		var dist = (board_size_y - y) * 80;
		board[y][x] = create_box_item();
		add_animation(board[y][x], 'box-drop-' + dist);
		append_to_cell(x, y, board[y][x]);
	}


	// row-filling function which creates a new box which drops into place
	var current_fill_row = -1;

	// update the board by dropping down floating tiles and adding new ones where necessary
	function update_board() {

		var y_segments = find_y_segments();
		var x_segments = find_x_segments();
		remove_y_segments(y_segments);
		remove_x_segments(x_segments);

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

	function find_segments(lines) {
		var segments = [];
		for (var i = 0; i < lines.length; i++) {
			var line_color = '';
			var line_length = 0;
			var line_offset = -1;
			var line_rainbow_length = 0;
			for (var k = 0; k < lines[i].length; k++) {
				if (lines[i][k] === 'rainbow') {
					line_rainbow_length++;
					if (line_color !== '') {
						line_length++;
					}
				} else if (line_color !== lines[i][k] || line_color === '') {
					if (line_length >= match_length_required) {
						segments.push({
							'line_index': i,
							'line_offset': line_offset,
							'line_color': line_color,
							'line_length': line_length,
						});
					}
					line_color = lines[i][k];
					line_offset = k - line_rainbow_length;
					line_length = line_rainbow_length + 1;
					line_rainbow_length = 0;
				} else {
					line_length++;
					line_rainbow_length = 0;
				}
			}

			if (line_length >= match_length_required) {
				segments.push({
					'line_index': i,
					'line_offset': line_offset,
					'line_color': line_color,
					'line_length': line_length,
				});
			}
		}

		return segments;
	}

	function find_y_segments() {
		var lines = [];
		for (var x = 0; x < board_size_x; x++) {
			var line_colors = [];
			for (var y = 0; y < board_size_y; y++) {
				if (board[y][x] !== undefined && '' + board[y][x].data('is-animating') !== 'true') {
					// console.log('is-animating: ' + board[y][x].data('is-animating'));
					line_colors[y] = board[y][x].data('box-color');
				}
				else
					line_colors[y] = '';
			}
			lines[x] = line_colors;
		}

		var segments = find_segments(lines);
		return segments;
	}

	function remove_y_segments(segments) {
		for (var i = 0; i < segments.length; i++) {
			var seg = segments[i];

			var x = seg.line_index;
			var start_y = seg.line_offset;
			var end_y = seg.line_offset + seg.line_length;

			// console.log("debug deleting line: ", x, start_y, end_y);
			for (var y = start_y; y < end_y; y++)
				delete_cell(x, y);
		}
	}

	function find_x_segments() {
		var lines = [];
		for (var y = 0; y < board_size_y; y++) {
			var line_colors = [];
			for (var x = 0; x < board_size_x; x++) {
				if (board[y][x] !== undefined && '' + board[y][x].data('is-animating') !== 'true') {
					// console.log('is-animating: ' + board[y][x].data('is-animating'));
					line_colors[x] = board[y][x].data('box-color');
				}
				else
					line_colors[x] = '';
			}
			lines[y] = line_colors;
		}

		var segments = find_segments(lines);
		return segments;
	}

	function remove_x_segments(segments) {
		for (var i = 0; i < segments.length; i++) {
			var seg = segments[i];

			var y = seg.line_index;
			var start_x = seg.line_offset;
			var end_x = seg.line_offset + seg.line_length;

			// console.log("debug deleting line: ", x, start_y, end_y);
			for (var x = start_x; x < end_x; x++)
				delete_cell(x, y);
		}
	}

	// trigger updates on interval
	setInterval(update_board, 100);

});

