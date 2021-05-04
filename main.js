var e;
var result = [];
var begin;
var until;
var step = 0;
var code;
var is_init = false;

function prepareEmu() {
    if (!is_init) {
        resetEmu();
        is_init = true;
    }

    var assembly = $("#input_asm").val();

    var a = new ks.Keystone(ks.ARCH_X86, ks.MODE_64);
    a.option(ks.OPT_SYNTAX, ks.OPT_SYNTAX_INTEL);

    result = [];
    code = a.asm(assembly);
    assembly = assembly.replace(/\n*$/, '').split('\n')

    for (var i = 0; i < assembly.length; i++) {
        asm_line = a.asm(assembly[i]);
        result.push(asm_line);
    }

    a.close();

    var addr = 0x10000;

    resetRegs();

    e.mem_map(addr, 4*1024, uc.PROT_ALL);
    e.mem_write(addr, code)
    begin = addr;
    until = begin + code.length;
}

function runEmu() {
    prepareEmu();
    e.emu_start(begin, until, 0, 0);
    displayRegs();
}

function stepEmu() {
    if (step == 0) {
        prepareEmu();
    }
    // resetRegs();
    step++;
    var rip = e.reg_read_i64(uc.X86_REG_RIP)
    if (step != 1) {
        begin = rip
    }
    e.emu_start(begin, until, 0, 1);
    displayRegs();
}

function displayRegs() {
    // Read registers
    var rax = e.reg_read_i64(uc.X86_REG_RAX);
    var rbx = e.reg_read_i64(uc.X86_REG_RBX);
    var rcx = e.reg_read_i64(uc.X86_REG_RCX);
    var rdx = e.reg_read_i64(uc.X86_REG_RDX);
    var rdi = e.reg_read_i64(uc.X86_REG_RDI);
    var rsi = e.reg_read_i64(uc.X86_REG_RSI);
    $("#reg_rax").html(rax);
    $("#reg_rbx").html(rbx);
    $("#reg_rcx").html(rcx);
    $("#reg_rdx").html(rdx);
    $("#reg_rdi").html(rdi);
    $("#reg_rsi").html(rsi);
}

function resetEmu() {
    e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
    step = 0;
    $("#reg_rax").html(0);
    $("#reg_rbx").html(0);
    $("#reg_rcx").html(0);
    $("#reg_rdx").html(0);
    $("#reg_rdi").html(0);
    $("#reg_rsi").html(0);
}

function resetRegs() {
    // Write registers and memory
    e.reg_write_i64(uc.X86_REG_RAX, 0x0);
    e.reg_write_i64(uc.X86_REG_RBX, 0x0);
    e.reg_write_i64(uc.X86_REG_RCX, 0x0);
    e.reg_write_i64(uc.X86_REG_RDX, 0x0);
    e.reg_write_i64(uc.X86_REG_RSI, 0x0);
    e.reg_write_i64(uc.X86_REG_RDI, 0x0);
}