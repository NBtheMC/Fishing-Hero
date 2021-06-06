class Dialogue extends Phaser.Scene {
    constructor() {
        super("dialogueScene");
        // dialog constants
        this.DBOX_X = 0;
        this.DBOX_Y = 350;
        this.DBOX_FONT = 'gem_font';	// dialog box font key

        this.TEXT_X = this.DBOX_X;			// text w/in dialog box x-position
        this.TEXT_Y = this.DBOX_Y;			// text w/in dialog box y-position
        this.TEXT_SIZE = 24;		// text font size (in pixels)
        this.TEXT_MAX_WIDTH = 300 ;	// max width of text within box

        this.NEXT_TEXT = '[SPACE]';	// text to display for next prompt
        this.NEXT_X = this.DBOX_X;			// next text prompt x-position
        this.NEXT_Y = this.DBOX_Y;			// next text prompt y-position

        this.LETTER_TIMER = 10;		// # ms each letter takes to "type" onscreen

        // dialog variables
        this.dialogConvo = 0;			// current "conversation"
        this.dialogLine = 0;			// current line of conversation
        this.dialogSpeaker = null;		// current speaker
        this.dialogLastSpeaker = null;	// last speaker
        this.dialogTyping = false;		// flag to lock player input while text is "typing"
        this.dialogText = null;			// the actual dialog text
        this.nextText = null;			// player prompt text to continue typing
        this.flag = 0;
    }

    create() {
        // parse dialog from JSON file
        this.dialog = this.cache.json.get('dialog');
        //console.log(this.dialog);

        this.DBOX_X = playerX - 200;			    // dialog box x-position
        this.TEXT_X = this.DBOX_X - 140;			// text w/in dialog box x-position
        this.TEXT_Y = this.DBOX_Y - 75;			// text w/in dialog box y-position

        this.NEXT_X = this.DBOX_X + 150;			// next text prompt x-position
        this.NEXT_Y = this.DBOX_Y + 50;			// next text prompt y-position

        // add dialog box sprite
        this.dialogbox = this.add.sprite(this.DBOX_X, this.DBOX_Y, 'dialogbox');
        //this.dialogbox = this.add.sprite(playerX, playerY, 'dialogbox');

        // initialize dialog text objects (with no text)
        this.dialogText = this.add.bitmapText(this.TEXT_X, this.TEXT_Y, this.DBOX_FONT, '', this.TEXT_SIZE);
        this.nextText = this.add.bitmapText(this.NEXT_X, this.NEXT_Y, this.DBOX_FONT, '', this.TEXT_SIZE);

        // input
        cursors = this.input.keyboard.createCursorKeys();

        // start dialog
        this.typeText();        
    }

    update() {
        // check for spacebar press
        if(Phaser.Input.Keyboard.JustDown(cursors.space) && !this.dialogTyping) {
            // trigger dialog
            this.typeText();
        }
    }

    typeText() {
        // If there are no conversations left and a conversation is triggered
        // lock input while typing
        this.dialogTyping = true;

        // clear text
        this.dialogText.text = '';
        this.nextText.text = '';

        /* Note: In my conversation data structure:  
                - each array within the main JSON array is a "conversation"
                - each object within a "conversation" is a "line"
                - each "line" can have 3 properties: 
                    1. a speaker (required)
                    2. the dialog text (required)
                    3. an (optional) flag indicating if this speaker is new
        */

        // make sure there are lines left to read in this convo, otherwise jump to next convo
        if(this.dialogLine > this.dialog[this.dialogConvo].length - 1) {
            this.dialogLine = 0;
            // I increment conversations here, but you could create logic to exit the dialog here
            this.dialogConvo++;
            convoCounter++;
            this.flag = 1;
        }
        
        // make sure we haven't run out of conversations...
        if(this.dialogConvo >= this.dialog.length || this.flag == 1) {
            this.flag = 0;
            // here I'm simply "exiting" the last speaker and removing the dialog box,
            // but you could build other logic to change game states here
            // make text box invisible
            this.dialogbox.visible = false;
            this.scene.stop()
            this.scene.resume('playScene');
        } else {
            // if not, set current speaker
            this.dialogSpeaker = this.dialog[this.dialogConvo][this.dialogLine]['speaker'];
            if(this.dialogSpeaker == "Cassian") {
                this.dialogbox.x = playerX-200;
                this.dialogbox.y = 350;
                this.dialogText.x = this.DBOX_X - 140;			// text w/in dialog box x-position
                this.dialogText.y = this.DBOX_Y - 75;			// text w/in dialog box y-position
                this.NEXT_X = this.DBOX_X + 150;			// next text prompt x-position
                this.NEXT_Y = this.DBOX_Y + 50;			// next text prompt y-position
            }
            if(this.dialogSpeaker == "Viola" && convoCounter == -1) {
                this.dialogbox.x = 900;
                this.dialogbox.y = 120;
                this.dialogText.x = 900-140;
                this.dialogText.y = 120-75;
                this.NEXT_X = 900+150;
                this.NEXT_Y = 120+50;
                violaFlag = 1;
            }
            if(this.dialogSpeaker == "Viola" && convoCounter == 0) {
                this.dialogbox.x = 530;
                this.dialogbox.y = 120;
                this.dialogText.x = 530-140;
                this.dialogText.y = 120-75;
                this.NEXT_X = 530+150;
                this.NEXT_Y = 120+50;
                violaFlag = 2;
            }
            if(this.dialogSpeaker == "Viola" && convoCounter == 1) {
                this.dialogbox.x = 900;
                this.dialogbox.y = 350;
                this.dialogText.x = 900-140;
                this.dialogText.y = 350-75;
                this.NEXT_X = 900+150;
                this.NEXT_Y = 350+50;
                violaFlag = 2;
            }
            // build dialog (concatenate speaker + line of text)
            this.dialogLines = this.dialog[this.dialogConvo][this.dialogLine]['speaker'].toUpperCase() + ': ' + this.dialog[this.dialogConvo][this.dialogLine]['dialog'];
            // create a timer to iterate through each letter in the dialog text
            let currentChar = 0; 
            this.textTimer = this.time.addEvent({
                delay: this.LETTER_TIMER,
                repeat: this.dialogLines.length - 1,
                callback: () => { 
                    // concatenate next letter from dialogLines
                    this.dialogText.text += this.dialogLines[currentChar];
                    // advance character position
                    currentChar++;
                    // check if timer has exhausted its repeats 
                    // (necessary since Phaser 3 no longer seems to have an onComplete event)
                    if(this.textTimer.getRepeatCount() == 0) {
                        // show prompt for more text
                        this.nextText = this.add.bitmapText(this.NEXT_X, this.NEXT_Y, this.DBOX_FONT, this.NEXT_TEXT, this.TEXT_SIZE).setOrigin(1);
                        // un-lock input
                        this.dialogTyping = false;
                        // destroy timer
                        this.textTimer.destroy();
                    }
                },
                callbackScope: this // keep Scene context
            });
            
            // set bounds on dialog
            this.dialogText.maxWidth = this.TEXT_MAX_WIDTH;

            // increment dialog line
            this.dialogLine++;

            // set past speaker
            this.dialogLastSpeaker = this.dialogSpeaker;
        }
    }
}