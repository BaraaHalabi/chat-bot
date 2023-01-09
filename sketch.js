let bot;
let text_input, text_output;
let characterTrie;
let wordTrie;

async function loadBot() {
  await bot.loadFile('brain.rive.txt');
  bot.sortReplies();
  let num = floor(random(100)) + 1;
  console.log(num);
  await bot.reply('local-user', 'set ' + num);
}

async function chat() {
  let txt = text_input.value();
  let reply = await bot.reply('local-user', txt);
  text_output.html(reply);
}

function setup() {
  noCanvas();
  bot = new RiveScript();
  loadBot();
  populateChips();
  sendBotMessage('Hi im Botty the chat bot, How can I help you?');
  characterTrie = new Trie();
  wordTrie = new Trie();
}

//my added code

let chips = ['word1', 'word2', 'word3'];

document.addEventListener("keypress", (event) => {
    if(event.key === 'Enter') sendClientMessage();
});

const populateChips = () => {
    $('#chips-input').empty();
    chips.forEach((chip, index) => {
        const element = $(`<span id="${index}" class="chip">${chip}</span>`);
        $('#chips-input').append(element);
        $(`#${index}`).click(() => {
            const val = $('#msg-input').val();
            const regex = /.+/g;
            $('#msg-input').val(val + (regex.test(val) ? ' ' : '') + chip);
        });
    });
}

const sendClientMessage = () => {
    const regex = /.+/g;
    const content = $('#msg-input').val();
    if(!regex.test(content)) return;
    const msg = $(`<div id="message-container" class="sender"><div id="message">${content}</div></div>`);
    $('#container').append(msg).scrollTop($('#container').prop("scrollHeight"));
    $('#msg-input').val('');

    handleMessage(content);
}

const sendBotMessage = (message) => {
    const msg = $(`<div id="message-container" class="receiver"><div id="message">${message}</div></div>`);
    $('#container').append(msg).scrollTop($('#container').prop("scrollHeight"));    
    $('#msg-input').val('');
}

const handleMessage = (message) => {
  bot.reply('local-user', message).then((replay) => sendBotMessage(replay));

  let messageWords = message.split(" ");

  // deal with a single word
  for(let word of messageWords){
    characterTrie.insert(word);
  }

  // deal with a sentense
  wordTrie.insert(messageWords);


}



$('#msg-input').keyup(() => {
    let text = $('#msg-input').val();
    typedWords = text.split(" ")[text.split(" ").length - 1];
    let autoCompletedWords = characterTrie.findAllWith(typedWords);
    let autoComletedSentense = wordTrie.findAllWith(text.split(" "));

    chips = [autoCompletedWords.length + autoComletedSentense.length];
    if(typedWords.length < 1) return;
    let j;
    for(let i=0; i<autoCompletedWords.length; i++){
        chips[i] = autoCompletedWords[i];
        j = i;
    }

    for(let i=0; i<autoComletedSentense.length; i++){
        j++;
        chips[j] = autoComletedSentense[i];
    }
    populateChips();
  });



const TrieNode = function (teken) {
    this.teken = teken;
    this.parent = null;
    this.children = {};    
    this.isEndNode = false;
    
    this.getNodeSequence = function() {
      let output = [];
      let node = this;
  
      while (node !== null) {
        output.unshift(node.teken);
        node = node.parent;
      }
      return output.join('');
    };
  }
  
  const Trie = function() {
    this.root = new TrieNode(null);
    
    this.insert = function(sequence) {
      let node = this.root;
  
      for(let i = 0; i < sequence.length; i++) {
        if (!node.children[sequence[i]]) {
          node.children[sequence[i]] = new TrieNode(sequence[i]);
          node.children[sequence[i]].parent = node;
        }
  
        node = node.children[sequence[i]];
  
        if (i == sequence.length-1) {
          node.isEndNode = true;
        }
      }
    };
    
    this.contains = function(sequence) {
      let node = this.root;
  
      for(let i = 0; i < sequence.length; i++) {
        if (node.children[sequence[i]]) {
          node = node.children[sequence[i]];
        } else {
          return false;
        }
      }
  
      return node.isEndNode;
    };
    
    this.findAllWith = function(prefix) {
      let node = this.root;
      let output = [];
  
      for(let i = 0; i < prefix.length; i++) {
        if (node.children[prefix[i]]) {
          node = node.children[prefix[i]];
        } else {
          return output;
        }
      }
  
      findAllSequenceFrom(node, output);
  
      return output;
    };
    
    const findAllSequenceFrom = (node, arr) => {
      if (node.isEndNode) {
        arr.unshift(node.getNodeSequence());
      }
      
      for (let child in node.children) {
        findAllSequenceFrom(node.children[child], arr);
      }
    }
  
    
  }