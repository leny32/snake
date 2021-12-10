fx_version 'cerulean'
game 'gta5'

ui_page 'html/index.html'

client_scripts {
    'client/main.lua',
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/media/*.mp3',
    'html/media/*.ogg',
    'html/media/*.png'
}

exports {
    'OpenHackingGame',
    'GetHackingStatus',
}