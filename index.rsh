'reach 0.1';

const[finalResult, S_WINS, M_WINS] = makeEnum(2);

//const winner

//assert(winner()) 

forall(UInt, numberSam =>
    forall(UInt, numberMike => 
        assert(finalResult(winner(numberSam, numberMike)))));

const Player ={
    ...hasRandom,
    getNumber : Fun([], UInt),
    getGuess : Fun([], UInt),
    seeOutcome : Fun([UInt], Null),
    informTimeout : Fun([], Null),
};

export const main = Reach.App(() =>{
    const Sam = Participant ('Sam', {
        ...Player,
        wager : UInt,
        deadline : UInt,
    });
    const Mike = Participant ('Mike', {
        ...Player,
        acceptWager : Fun([UInt], Null),
    });
    init();

    const informTimeout = () => {
        each([Sam, Mike], () => {
            interact.informTimeout()
        });
    };

    Sam.only(() => {
        const amount = declassify(interact.wager);
        const deadline = declassify(interact.deadline);
    });
    Sam.publish(amount, deadline)
        .pay(amount);
        commit();

    Mike.interact.acceptWager(amount);
    Mike.pay(amount)
        .timeout(relativeTime(deadline), () => closeTo(Sam, informTimeout));

    var result = DRAW;
    invariant(balance() == 2 * amount && finalResult(result));
    while (result == DRAW) {
        commit();

        Sam.only(() => {
            const numberS = interact.getNumber();
            const _guessS = interact.getGuess();

            const [_guessCommitS, _guessSaltS] = makeCommitment(interact, _guessS);
            const guessCommitS = declassify(_guessCommitS);
        });
        Sam.publish(numberS, guessCommitS)
            .timeout(relativeTime(deadline), () => closeTo(Mike, informTimeout));
            commit();

        unknowable(Mike, Sam (_guessS, _guessSaltS));

        Mike.only(() => {
            const numberM = interact.getNumber();
            const _guessM = interact.getGuess();

            const numberM = declassify(numberM);
            const guessM = declassify(_guessM) 
        });
        Mike.publish(numberM, guessM)
            .timeout(relativeTime(deadline), () => closeTo(Sam, informTimeout));
            commit()

        Sam.only(() => {
            const [guessSaltS, guessS] = declassify([_guessSaltS, _guessY]);
        })

        Sam.publish(guessSaltS, guessS)
            .timeout(relativeTime(deadline), () => closeTo(Mike, informTimeout));
            
        checkCommitment(guessCommitS, guessSaltS, guessS)

        result = winner(numberS, numberM, guessS, guessM);
        continue;
    }
    assert(result == S_WINS || result == M_WINS);

    transfer(2 * amount).to(result == S_WINS ? Sam : Mike)
     commit()
    
    each([Sam, Mike], () => {
        interact.seeOutcome(result)
    });

    exit();
});
