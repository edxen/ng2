var stats,
    logs_order=0,
    stats_guide = ['pow', 'spd', 'int', 'vit'],
    class_guide = ['kn', 'as', 'ma', 'hu'];
    kn = [10, 3, 3, 14],
    as = [14, 15, 3, 3],
    ma = [3, 3, 15, 9],
    hu = [11, 15, 3, 6],
    on_battle=false,
    can_press=false;;

jQuery(function() {
    $(document).ready(function() {
        addLogs('Welcome!')
        load_data();

    });
    $('select.stats-class').on('change', function() {
        load_data();
    });

    $('.content-container').on('click', '.btn-stats-battle', function(event) {
        battle_stats();
        addLogs('Commence Battle!!');
        $('.battle-container').removeClass('disabled');
        $('.btn-stats-battle').addClass('disabled');
        $('.stats-hero').addClass('disabled');
        $('.stats-enemy').addClass('disabled');
        on_battle=true;
        can_press=true;
    });
    $('.content-container').on('click', '.btn-stats-reset', function(event) {
        battleReset();
        addLogs('Battle reset...');
    });
    $('.content-container').on('click', '.btn-stats-disabled', function(event) {
        $('.disabled').removeClass('disabled');
    });

    $('.content-container').on('click', '.battle-actions button', function(event) {
        $('.battle-container').addClass('disabled');
        can_press=false;
        var e_option = enemy_option();
        if($(this).hasClass('btn-atk')) hero_atk(e_option);
        if($(this).hasClass('btn-def')) hero_def(e_option);
        if($(this).hasClass('btn-cntr')) hero_cntr(e_option);
        if(on_battle){
            setTimeout(function(){
                $('.battle-container').removeClass('disabled');
                can_press=true;
            }, 1000);
        }
    });

    $(document).keypress(function(e) {
        if(on_battle && can_press){
          if(e.which == 65 || e.which == 97) {
              $('.btn-atk').click();
              console.log('clicked a');
          }
          if(e.which == 83 || e.which == 115) $('.btn-def').click();
          if(e.which == 68 || e.which == 100) $('.btn-cntr').click();
        }
    });
});

function hero_atk(e_option){
    if(e_option==0){
        if(first_move()=='hero'){
            atk('hero', 'enemy');
            atk('enemy', 'hero', true);
        }else{
            atk('enemy', 'hero');
            atk('hero', 'enemy', true);
        }
    }
    if(e_option==1) def('hero', 'enemy');
    if(e_option==2) cntr('hero', 'enemy');
}


function hero_def(e_option){
    if(e_option==0) def('enemy', 'hero');
    if(e_option==1) messageOption(0, 0, 4);
    if(e_option==2) cntr('enemy', 'hero', 0, 'def');
}

function hero_cntr(e_option){
    if(e_option==0) cntr('enemy', 'hero');
    if(e_option==1) cntr('hero', 'enemy', 0, 'def');
    if(e_option==2){
        if(first_move()=='hero'){
            cntr('enemy', 'hero');
        }else{
            cntr('hero', 'enemy');
        }
    }
}

function atk(self, target, two_turns, self_move){
    var self_ = $('.char-'+self),
        target_ = $('.char-'+target),
        timeout=0;
    if(two_turns) timeout=500;

    setTimeout(function(){
        computeDMG(self, target, 0, self_, target_);
        if(self_.attr('data-class')=='as') computeDMG(self, target, 1, self_, target_);
    },timeout);
}

function def(self, target, two_turns, self_move){
    var self_ = $('.char-'+self),
        target_ = $('.char-'+target),
        timeout=0;

        computeDMG(self, target, 2, self_, target_, 'def');
        if(self_.attr('data-class')=='as') computeDMG(self, target, 3, self_, target_, 'def');
}

function cntr(self, target, two_turns, self_move){
    var self_ = $('.char-'+self),
        target_ = $('.char-'+target),
        timeout=0;

        if(self_move=='def'){
            computeDMG(self, target, 6, self_, target_, 'cntr');
        }else{
            computeDMG(self, target, 5, self_, target_, 'cntr');
        }

        if(self_.attr('data-class')=='as') computeDMG(self, target, 1, self_, target_);
}

function computeDMG(self, target, option, self_, target_, e_option){
    if(on_battle){
        var atkdmg=calculateDamage(self_, e_option),
            eatkdmg=calculateDamage(target_, e_option);

        calculateHealth(self, target, atkdmg, eatkdmg, e_option);
        messageOption(self, target, option, atkdmg, eatkdmg);
        if(on_battle==self||on_battle==target){
            messageOption(self, target, 99, atkdmg, eatkdmg, on_battle);
            battleReset();
            on_battle=false;
        }
    }
}

function calculateHealth(self, target, atkdmg, eatkdmg, e_option){
    var self_hp = $('.char-'+self+' .battle-hp'),
        target_hp = $('.char-'+target+' .battle-hp'),
        wnnr, sndr, rcvr, dmg;

    if(e_option=='cntr'){
        wnnr=target, sndr=target_hp, rcvr=self_hp, dmg=eatkdmg;
    }else{
        wnnr=self, sndr=self_hp, rcvr=target_hp, dmg=atkdmg;
    }
    var current_hp = rcvr.attr('value');
    rcvr.attr('value', current_hp-=dmg);

    if(rcvr.val()<=0){
        on_battle=wnnr;
        rcvr.attr('value', 0);
    }
}

function calculateDamage(target, e_option){
    var dmg = target.attr('data-dmg');
    var min = parseInt(dmg)-2, max = parseInt(dmg)+2;
    calcDmg=parseInt(Math.floor(Math.random() * ((max+1) - min)) + min);
    console.log('initial:'+calcDmg);
    if(e_option=='def') calcDmg = calcDmg*0.75;
    if(e_option=='cntr') calcDmg = calcDmg*1.50;
    console.log('final:'+calcDmg);

    if(calcDmg<1){
        return 1;
    }else{
        return calcDmg;
    }
}

function messageOption(self, target, option, atkdmg, eatkdmg, wnnr){
    if(option==0) addLogs(self+' is attacking! inflicted '+atkdmg+' dmg');
    if(option==1) addLogs(self+' activates double attack! inflicted '+atkdmg+' dmg');
    if(option==2) addLogs(self+' is attacking but '+target+' defended! inflicted '+atkdmg+' dmg');
    if(option==3) addLogs(self+' activates double attack but '+target+' is still defending! inflicted '+atkdmg+' dmg');
    if(option==4) addLogs('both side defended, no damage inflicted this turn');
    if(option==5) addLogs(self+' attacks but '+target+' countered! '+target+' inflicts '+eatkdmg+' dmg');
    if(option==6) addLogs(self+' tries to counter attack but '+target+' in defense anticipated and counters back! '+target+' inflicts '+eatkdmg+' dmg');

    if(option==99) addLogs(wnnr+' wins!!');

}

function addLogs(val){
    $('.logs-textarea').text(logs_order+': '+val+'\n'+$('.logs-textarea').text())
    logs_order++
}

function enemy_option(){
    var e_moveset = [0,0,0,0,1,1,1,2,2,2];
    return e_moveset[randomize()]
}


function first_move(){
    var hero_spd = $('.char-hero').attr('data-spd');
    var enemy_spd = $('.char-enemy').attr('data-spd');
    if(hero_spd || enemy_spd){
        if(hero_spd<enemy_spd) return 'hero';
        if(hero_spd>enemy_spd) return 'enemy';
        if(hero_spd==enemy_spd){
            if(randomize()<=5) return 'hero';
            return 'enemy';
        }
    }
}

function randomize(){
    return Math.floor(Math.random()*10);
}

function load_data(){
    for(i=0; i < 2;i++){
        var this_ = $('.stats-class').eq(i).closest('table').parent();
        for(ii=0; ii < class_guide.length;ii++){
            if(this_.find(':selected').val()==class_guide[ii]){
                for(iii=0; iii < stats_guide.length;iii++){
                    this_.find('.stats-'+stats_guide[iii]).attr('value',(eval(class_guide[ii])[iii]));
                }
            }
        }
    }
}

function battleReset(){
    $('.battle-container').addClass('disabled');
    $('.btn-stats-battle').removeClass('disabled');
    $('.stats-hero').removeClass('disabled');
    $('.stats-enemy').removeClass('disabled');
}

function init_data(value){
    var kn_stats = [10, 3, 3, 14],
    as_stats = [14, 15, 3, 3],
    ma_stats = [3, 3, 15, 9],
    hu_stats = [11, 15, 3, 6],
    stats_arr = {kn_stats, as_stats, ma_stats, hu_stats};

    return stats_arr[value];
}

function battle_stats(value){
    stats=[];
    for(i=0; i < 2;i++){
        var this_ = $('.stats-class').eq(i).closest('table').parent();
        var char_stats={
            char:this_.attr('class').substring(6,20),
            class:this_.find(':selected').val(),
            pow:this_.find('.stats-pow').val(),
            spd:this_.find('.stats-spd').val(),
            int:this_.find('.stats-int').val(),
            vit:this_.find('.stats-vit').val(),
            dmg:this_.find('.stats-pow').val()*.55,
            mgcdmg:this_.find('.stats-int').val()*.55,
            hp:this_.find('.stats-vit').val()*3.25
        }
        stats.push(char_stats);

        var this__ = $('.battle-char').eq(i);
        this__.attr('data-class', this_.find(':selected').val());
        this__.attr('data-dmg', Math.round(stats[i].dmg));
        this__.attr('data-mgcdmg', Math.round(stats[i].mgcdmg));
        this__.attr('data-hp', Math.round(stats[i].hp));
        this__.attr('data-spd', Math.round(stats[i].spd));

        this__.find('input').attr('data-ohp', this__.attr('data-hp'));
        this__.find('input').attr('data-chp', this__.attr('data-hp'));
        this__.find('input').attr('value', this__.attr('data-hp'));

        var battleDmg = this__.attr('data-dmg'),
            battleDmg_min = Number(battleDmg)-2,
            battleDmg_max = Number(battleDmg)+2,
            battleMgcDmg = this__.attr('data-mgcdmg'),
            battleMgcDmg_min = Number(battleMgcDmg)-2,
            battleMgcDmg_max = Number(battleMgcDmg)+2;

        if(battleDmg_min<1) battleDmg_min=1
        if(battleMgcDmg_min<1) battleMgcDmg_min=1

        this__.find('.battle-dmg').text(battleDmg_min+'~'+battleDmg_max);
        this__.find('.battle-mgcdmg').text(battleMgcDmg_min+'~'+battleMgcDmg_max);
        this__.find('.battle-spd').text(this__.attr('data-spd'));
    }
}

