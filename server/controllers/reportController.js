
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Fine = require("../models/Fine");
const Issue = require("../models/Issue");
const Visitor = require("../models/Visitor");


exports.getIssueVisitorFinesReport = async (req, res) => {
  try {

    const year = req.params.year;
   
    //Get all the issues (completed and not completed for each month)
    const issues = await Issue.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${year}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "Completed"] }, 1, 0]
              }
            },
            notCompleted: {
              $sum: {
                $cond: [{ $ne: ["$status", "Completed"] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $facet: {
            issues: [
              {
                $project: {
                  _id: 1,
                  completed: 1,
                  notCompleted: 1
                }
              }
            ],
            months: [
              {
                $project: {
                  months: [
                    { _id: 1, completed: 0, notCompleted: 0 },
                    { _id: 2, completed: 0, notCompleted: 0 },
                    { _id: 3, completed: 0, notCompleted: 0 },
                    { _id: 4, completed: 0, notCompleted: 0 },
                    { _id: 5, completed: 0, notCompleted: 0 },
                    { _id: 6, completed: 0, notCompleted: 0 },
                    { _id: 7, completed: 0, notCompleted: 0 },
                    { _id: 8, completed: 0, notCompleted: 0 },
                    { _id: 9, completed: 0, notCompleted: 0 },
                    { _id: 10, completed: 0, notCompleted: 0 },
                    { _id: 11, completed: 0, notCompleted: 0 },
                    { _id: 12, completed: 0, notCompleted: 0 }
                  ]
                }
              },
              { $unwind: "$months" },
              { $replaceRoot: { newRoot: "$months" } }
            ]
          }
        },
        {
          $project: {
            data: {
              $map: {
                input: { $range: [1, 13] },
                as: "month",
                in: {
                  $mergeObjects: [
                    { _id: "$$month", completed: 0, notCompleted: 0 },
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$issues",
                            as: "issue",
                            cond: { $eq: ["$$issue._id", "$$month"] }
                          }
                        },
                        0
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        { $unwind: "$data" },
        { $replaceRoot: { newRoot: "$data" } }
      ]);
      
      console.log(issues);

      //Get total number of visitors for each month(find date from checkInTime)
        const visitors = await Visitor.aggregate([
            {
            $match: {
                checkInTime: {
                $gte: new Date(`${year}-01-01`),
                $lt: new Date(`${year}-12-31`)
                }
            }
            },
            {
            $group: {
                _id: { $month: "$checkInTime" },
                totalVisitors: { $sum: 1 }
            }
            },
            {
            $sort: { _id: 1 }
            },
            {
            $facet: {
                visitors: [
                {
                    $project: {
                    _id: 1,
                    totalVisitors: 1
                    }
                }
                ],
                months: [
                {
                    $project: {
                    months: [
                        { _id: 1, totalVisitors: 0 },
                        { _id: 2, totalVisitors: 0 },
                        { _id: 3, totalVisitors: 0 },
                        { _id: 4, totalVisitors: 0 },
                        { _id: 5, totalVisitors: 0 },
                        { _id: 6, totalVisitors: 0 },
                        { _id: 7, totalVisitors: 0 },
                        { _id: 8, totalVisitors: 0 },
                        { _id: 9, totalVisitors: 0 },
                        { _id: 10, totalVisitors: 0 },
                        { _id: 11, totalVisitors: 0 },
                        { _id: 12, totalVisitors: 0 }
                    ]
                    }
                },
                { $unwind: "$months" },
                { $replaceRoot: { newRoot: "$months" } }
                ]
            }
            },
            {
            $project: {
                data: {
                $map: {
                    input: { $range: [1, 13] },
                    as: "month",
                    in: {
                    $mergeObjects: [
                        { _id: "$$month", totalVisitors: 0 },
                        {
                        $arrayElemAt: [
                            {
                            $filter: {
                                input: "$visitors",
                                as: "visitor",
                                cond: { $eq: ["$$visitor._id", "$$month"] }
                            }
                            },
                            0
                        ]
                        }
                    ]
                    }
                }
                }
            }
            },
            { $unwind: "$data" },
            { $replaceRoot: { newRoot: "$data" } }
        ]);

        console.log(visitors);

        //Get (oustanding, not outstanding) for each month (isPaid is false if outstanding else not outstanding),
        const fines = await Fine.aggregate([
            {
            $match: {
                dateIssued: {
                $gte: new Date(`${year}-01-01`),
                $lt: new Date(`${year}-12-31`)
                }
            }
            },
            {
            $group: {
                _id: { $month: "$dateIssued" },
                outstanding: {
                $sum: {
                    $cond: [{ $eq: ["$isPaid", false] }, 1, 0]
                }
                },
                notOutstanding: {
                $sum: {
                    $cond: [{ $eq: ["$isPaid", true] }, 1, 0]
                }
                }
            }
            },
            {
            $sort: { _id: 1 }
            },
            {
            $facet: {
                fines: [
                {
                    $project: {
                    _id: 1,
                    outstanding: 1,
                    notOutstanding: 1
                    }
                }
                ],
                months: [
                {
                    $project: {
                    months: [
                        { _id: 1, outstanding: 0, notOutstanding: 0 },
                        { _id: 2, outstanding: 0, notOutstanding: 0 },
                        { _id: 3, outstanding: 0, notOutstanding: 0 },
                        { _id: 4, outstanding: 0, notOutstanding: 0 },
                        { _id: 5, outstanding: 0, notOutstanding: 0 },
                        { _id: 6, outstanding: 0, notOutstanding: 0 },
                        { _id: 7, outstanding: 0, notOutstanding: 0 },
                        { _id: 8, outstanding: 0, notOutstanding: 0 },
                        { _id: 9, outstanding: 0, notOutstanding: 0 },
                        { _id: 10, outstanding: 0, notOutstanding: 0 },
                        { _id: 11, outstanding: 0, notOutstanding: 0 },
                        { _id: 12, outstanding: 0, notOutstanding: 0 }
                    ]
                    }
                },
                { $unwind: "$months" },
                { $replaceRoot: { newRoot: "$months" } }
                ]
            }
            },
            {
            $project: {
                data: {
                $map: {
                    input: { $range: [1, 13] },
                    as: "month",
                    in: {
                    $mergeObjects: [
                        { _id: "$$month", outstanding: 0, notOutstanding: 0 },
                        {
                        $arrayElemAt: [
                            {
                            $filter: {
                                input: "$fines",
                                as: "fine",
                                cond: { $eq: ["$$fine._id", "$$month"] }
                            }
                            },
                            0
                        ]
                        }
                    ]
                    }
                }
                }
            }
            },
            { $unwind: "$data" },
            { $replaceRoot: { newRoot: "$data" } }
        ]);
        
       
            
                    
       

        console.log(fines);



     

    return res.status(200).json({ issues , visitors, fines});
   
    

  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ error: "Error fetching report data" });
  }
};

exports.getFinesReport = async (req, res) => {
    try {
  
      const userCode = req.params.userCode;

      
      const user = await User.findOne({ userCode: userCode })

      if(!user) return res.status(404).json({ error: "User not found" });
   
      const year = req.params.year;
     
      //Get all the fines (oustanding, not outstanding) for each month for a specific user(isPaid is false if outstanding else not outstanding),
      const fines = await Fine.aggregate([
        {
          $match: {
            issuedTo: userCode,
            dateIssued: {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${year}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { $month: "$dateIssued" },
            outstanding: {
              $sum: {
                $cond: [{ $eq: ["$isPaid", false] }, 1, 0]
              }
            },
            notOutstanding: {
              $sum: {
                $cond: [{ $eq: ["$isPaid", true] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $facet: {
            fines: [
              {
                $project: {
                  _id: 1,
                  outstanding: 1,
                  notOutstanding: 1
                }
              }
            ],
            months: [
              {
                $project: {
                  months: [
                    { _id: 1, outstanding: 0, notOutstanding: 0 },
                    { _id: 2, outstanding: 0, notOutstanding: 0 },
                    { _id: 3, outstanding: 0, notOutstanding: 0 },
                    { _id: 4, outstanding: 0, notOutstanding: 0 },
                    { _id: 5, outstanding: 0, notOutstanding: 0 },
                    { _id: 6, outstanding: 0, notOutstanding: 0 },
                    { _id: 7, outstanding: 0, notOutstanding: 0 },
                    { _id: 8, outstanding: 0, notOutstanding: 0 },
                    { _id: 9, outstanding: 0, notOutstanding: 0 },
                    { _id: 10, outstanding: 0, notOutstanding: 0 },
                    { _id: 11, outstanding: 0, notOutstanding: 0 },
                    { _id: 12, outstanding: 0, notOutstanding: 0 }
                  ]
                }
              },
              { $unwind: "$months" },
              { $replaceRoot: { newRoot: "$months" } }
            ]
          }
        },
        {
          $project: {
            data: {
              $map: {
                input: { $range: [1, 13] },
                as: "month",
                in: {
                  $mergeObjects: [
                    { _id: "$$month", outstanding: 0, notOutstanding: 0 },
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$fines",
                            as: "fine",
                            cond: { $eq: ["$$fine._id", "$$month"] }
                          }
                        },
                        0
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        { $unwind: "$data" },
        { $replaceRoot: { newRoot: "$data" } }
      ]);
    
        

       
        console.log(fines);

  
  
      return res.status(200).json({ fines });
     
      
  
    } catch (error) {
      console.error("Error fetching fines:", error);
      res.status(500).json({ error: "Error fetching fines" });
    }
  };


           

//Fines
//Maintaince issues (two lines for (issued/inprogress) and (completed))
//Visitor history

