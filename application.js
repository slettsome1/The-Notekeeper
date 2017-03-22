$(function(){

	// define the application
	var Notekeeper = {};                    //creates an object variable for the application

	(function(app){                        //creates the master function for the entire app--holds multiple sub-functions

		// variable definitions go here
		var $title = $('#title'),            // the $() makes this a jQuery object
			$note = $('#note'),
      $taskDate = $('#taskDate'),        //add the taskDate variable
    	$ul = $('#notesList'),
			li = '<li><a href="#pgNotesDetail?title=LINK">ID</a></li>',  //note that the title is also the href
			notesHdr = '<li data-role="list-divider">Your Notes</li>',
			noNotes = '<li id="noNotes">You have no notes</li>';

		app.init = function(){              // when the application initializes ....
			app.bindings();                  // link (bind) the application functions to the entered/stored data
			app.checkForStorage();
		};

		app.bindings = function(){        // what did the user want to do?  Identify where the touchend event occured 
			$('#btnAddNote').on('touchend', function(e){      //the user clicked on the AddNote button
				e.preventDefault();
				// save the note
				app.addNote(
					$('#title').val(),
          $('#taskDate').val(),
					$('#note').val()
				);
			});
			$(document).on('touchend', '#notesList a', function(e){   //the user clicked on one of the notes
				e.preventDefault();
				var href = $(this)[0].href.match(/\?.*$/)[0];          //use these regular patterns to find the note and load it
				var title = href.replace(/^\?title=/,'');
				app.loadNote(title);
			});
			$(document).on('touchend', '#btnDelete', function(e){    //the user clicked on the delete button
				e.preventDefault();
				var key = $(this).data('href');
				app.deleteNote(key);
			});
		};

		app.loadNote = function(title){                        //go to a new "page" and build the note content 
			// get notes
			var notes = app.getNotes(),
				// lookup specific note
				wholeNote = notes[title],                        //Because each note value contains the date and note contents
        stringArray = wholeNote.split("~"),              //separated by a tilde "~"; split the two and store each to 
        taskDate = stringArray[0],                       //a variable
        note = stringArray[1],
				page = ['<div data-role="page">',
							'<div data-role="header" data-add-back-btn="true">',
								'<h1>Notekeeper</h1>',
								'<a id="btnDelete" href="" data-href="ID" data-role="button" class="ui-btn-right">Delete</a>',
							'</div>',
							'<div role="main" class="ui-content"><h3>TITLE</h3><p>DATE</p><p>NOTE</p></div>',
						'</div>'].join('');
			var newPage = $(page);
			//append it to the page container
			newPage.html(function(index,old){
				return old
						.replace(/ID/g,title)
						.replace(/TITLE/g,title
            .replace(/-/g,' '))
            .replace(/DATE/g,taskDate)
						.replace(/NOTE/g,note);
			}).appendTo($.mobile.pageContainer);
			$.mobile.changePage(newPage);
		};

		app.addNote = function(title, taskDate, note){
      note = taskDate + "~" + note;                  //IMPORTANT!  This concatenates the taskDate and note into a single string with a tilde ("~")
                                                     //as the separator
			var notes = localStorage['Notekeeper'],        //add a note to the ones already in storage
				notesObj;
			if (notes === undefined || notes === '') {     //if there are no notes, start with an empty note object.
				notesObj = {};
			} else {
				notesObj = JSON.parse(notes);
			}
			notesObj[title.replace(/ /g,'-')] = note;
			localStorage['Notekeeper'] = JSON.stringify(notesObj);
			// clear the two form fields
			$note.val('');
			$title.val('');
      $taskDate.val('');
			//update the listview
			app.displayNotes();
		};

		app.getNotes = function(){
			// get notes
			var notes = localStorage['Notekeeper'];
			// convert notes from string to object
			if(notes) return JSON.parse(notes);
			return [];
		};

		app.displayNotes = function(){
			// get notes
			var notesObj = app.getNotes(),
				// create an empty string to contain html
				html = '',
				n; // make sure your iterators are properly scoped
			// loop over notes
			for (n in notesObj) {
				html += li.replace(/ID/g,n.replace(/-/g,' ')).replace(/LINK/g,n);
			}
			$ul.html(notesHdr + html).listview('refresh');
		};

		app.deleteNote = function(key){
			// get the notes from localStorage
			var notesObj = app.getNotes();
			// delete selected note
			delete notesObj[key];
			// write it back to localStorage
			localStorage['Notekeeper'] = JSON.stringify(notesObj);
			// return to the list of notes
			$.mobile.changePage('notekeeper.html');
			// restart the storage check
			app.checkForStorage();
		};

		app.checkForStorage = function(){
			var notes = app.getNotes();
			// are there existing notes?
			if (!$.isEmptyObject(notes)) {
				// yes there are. pass them off to be displayed
				app.displayNotes();
			} else {
				// nope, just show the placeholder
				$ul.html(notesHdr + noNotes).listview('refresh');
			}
		};

		app.init();

	})(Notekeeper);
});