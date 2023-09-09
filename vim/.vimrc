" leader 设为空格
" like <leader>w saves the current file
nnoremap <SPACE> <Nop>
map <Space> <Leader>

" 快捷键部分
" Fast saving 保存
nmap <leader>s :w!<cr>

" 按JK退出
inoremap jk <ESC>

" c 默认不复制，将c掉的内容到黑洞寄存器
nnoremap c "_c


" 使用系统剪贴板
set clipboard=unnamed

" Ignore case when searching 搜索忽略大小写
set ignorecase

" 1=启动显示状态行, 2=总是显示状态行.
" 设置总是显示状态行,方便看到当前文件名.
set laststatus=2

" 使用Tab键补全时,在状态栏显示匹配的列表,
" 方便查看都有哪些命令符合补全条件.
set wildmenu

" 光标立刻跳转到搜索到内容
set incsearch

" 搜索到最后匹配的位置后,再次搜索不回到第一个匹配处
set nowrapscan

" 输入Tab字符时,自动替换成空格
set expandtab

" 显示行号
set nu
set rnu    



" Sets how many lines of history VIM has to remember
set history=500

" Set to auto read when a file is changed from the outside
set autoread
au FocusGained,BufEnter * silent! checktime

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => 颜色和字体
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Enable syntax highlighting
syntax enable

" Set regular expression engine automatically
set regexpengine=0

" Enable 256 colors palette in Gnome Terminal
if $COLORTERM == 'gnome-terminal'
    set t_Co=256
endif

try
    colorscheme desert
catch
endtry

set background=dark

" Set extra options when running in GUI mode
if has("gui_running")
    set guioptions-=T
    set guioptions-=e
    set t_Co=256
    set guitablabel=%M\ %t
endif

" Set utf8 as standard encoding and en_US as the standard language
set encoding=utf8






"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => Text, tab and indent related
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Use spaces instead of tabs
set expandtab

" Be smart when using tabs ;)
set smarttab

" 1 tab == 4 spaces
set shiftwidth=4
set tabstop=4
