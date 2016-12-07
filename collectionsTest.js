/**
 * Created by adc90 on 12/6/2016.
 */
QUnit.test("Sum and reduction test", function (assert) {
    //Setup
    var rng = Collections.ToCollection(Collections.Range(1, 5))

    var sum = rng.Reduce(function (a, b) {
        return a + b;
    });
    var reduce = rng.Sum(function (f) {
        return f;
    });

    assert.ok(sum === 15, "[1..5] sum === 15");
    assert.ok(reduce === 15, "[1..5] reduce === 15");
    assert.ok(sum == reduce, "Sum of 1..5 === Reduction f = (a,b) => a + b");
});

QUnit.test("Sum and reduction test", function (assert) {
    //Setup
    var nm = Collections.ToCollection("Aaron".split(""))
        .Select(function (s) {
            return s.toLowerCase();
        }).Reverse().Reduce(function (a, b) {
            return a + b;
        });

    //Assert
    console.log(nm);
    assert.ok(nm === "noraa", "Aaron backwards and to lowercase === noraa");
});

QUnit.test("First and last test", function (assert) {
    //Setup
    var nm = Collections.ToCollection("Aaron".split(""));

    //Assert
    assert.ok(nm.First() === "A", "['Aaron'].ToCollection().First() === 'A'");
    assert.ok(nm.Last() === "n", "['Aaron'].ToCollection().First() === 'n'");
});
QUnit.test("Group by test", function (assert) {
    //Setup
    var GradeLevel = { FirstYear: 1, SecondYear: 2, ThirdYear: 3, FourthYear: 4 };
    var students = [
        {FirstName: "Terry", LastName: "Adams", ID: 120, Year: GradeLevel.SecondYear, ExamScores: [99, 82, 81, 79]},
        {FirstName: "Fadi", LastName: "Fakhouri", ID: 116, Year: GradeLevel.ThirdYear, ExamScores: [99, 86, 90, 94]},
        {FirstName: "Hanying", LastName: "Feng", ID: 117, Year: GradeLevel.FirstYear, ExamScores: [93, 92, 80, 87]},
        {FirstName: "Cesar", LastName: "Garcia", ID: 114, Year: GradeLevel.FourthYear, ExamScores: [97, 89, 85, 82]},
        {FirstName: "Debra", LastName: "Garcia", ID: 115, Year: GradeLevel.ThirdYear, ExamScores: [35, 72, 91, 70]},
        {FirstName: "Hugo", LastName: "Garcia", ID: 118, Year: GradeLevel.SecondYear, ExamScores: [92, 90, 83, 78]},
        {FirstName: "Sven", LastName: "Mortensen", ID: 113, Year: GradeLevel.FirstYear, ExamScores: [88, 94, 65, 91]},
        {FirstName: "Claire", LastName: "O'Donnell", ID: 112, Year: GradeLevel.FourthYear, ExamScores: [75, 84, 91, 39]},
        {FirstName: "Svetlana", LastName: "Omelchenko", ID: 111, Year: GradeLevel.SecondYear, ExamScores: [97, 92, 81, 60]},
        {FirstName: "Lance", LastName: "Tucker", ID: 119, Year: GradeLevel.ThirdYear, ExamScores: [68, 79, 88, 92]},
        {FirstName: "Michael", LastName: "Tucker", ID: 122, Year: GradeLevel.FirstYear, ExamScores: [94, 92, 91, 91]},
        {FirstName: "Eugene", LastName: "Zabokritski", ID: 121, Year: GradeLevel.FourthYear, ExamScores: [96, 85, 91, 60]}
    ];

    var s = Collections.ToCollection(students)
        .GroupBy(function(f) {
            return f.LastName;
        }).Where(function(f){
            return f.key === "Garcia"
        });
    var garciaAverage = Collections.ToCollection(s.First().values)
        .Select(function(f){
            return f.ExamScores;
        }).Flatten().Average();
    console.log(s.Collect());

    //Assert
    assert.ok(s.First().values.length == 3, "Three garcia's")
    assert.ok(Math.round(garciaAverage) === 80, "Garcia's average is 80");
});
